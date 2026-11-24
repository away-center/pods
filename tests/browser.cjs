const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
(async()=>{
  fs.mkdirSync('test-results',{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:4173';
  // Compare original DOM copy, section order, SVGs and image sources before scripts run.
  for(const file of ['index.html','start/index.html']){
    const old=execFileSync('git',['show',`33f797a79202827d2ff544334739e2892b7bcca2:${file}`],{encoding:'utf8'});
    const current=fs.readFileSync(file,'utf8');
    const result=await page.evaluate(({old,current})=>{
      const parse=s=>new DOMParser().parseFromString(s,'text/html');const a=parse(old),b=parse(current);
      // Explicitly approved product descriptions, heading, hero chips, category
      // CTA, hand-drawn arrowheads and official wordmark may differ from baseline.
      const omit='form,script,style,footer .support-links,.nav-meta,.nav-logo,.ap-brand,.rung-s,.ap-models,#ap-shapes-title,#ap-why-title,.ap-chips,.ap-section-aside,.pods-hero-topline,.ap-function-invite,.ap-model-path,.hero-meta';
      const texts=doc=>{doc.querySelectorAll(omit).forEach(x=>x.remove());const w=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);const out=[];while(w.nextNode()){const t=w.currentNode.textContent.replace(/\s+/g,' ').trim();if(t)out.push(t);}return out;};
      const graphics=doc=>[...doc.querySelectorAll('main svg,main img')].filter(x=>!x.closest('.annot,.exp-viz-foot,.pods-video-showcase,.pods-video-single')).map(x=>x.outerHTML);
      const sections=doc=>[...doc.querySelectorAll('section')].map(x=>x.id);
      const ag=graphics(a),bg=graphics(b),as=sections(a),bs=sections(b);const at=texts(a),bt=texts(b);
      let i=0;for(const text of bt)if(text===at[i])i++;return {allCopy:i===at.length,missing:at[i],graphics:ag.every(x=>bg.includes(x)),sections:JSON.stringify(as)===JSON.stringify(bs)};
    },{old,current});
    assert.ok(result.allCopy,`${file} missing copy: ${result.missing}`);assert.ok(result.graphics);assert.ok(result.sections);
  }
  for(const route of ['/','/start/','/contact/','/about/','/security/','/privacy-policy/','/terms-of-use/']){
    await page.goto(base+route);assert.ok(await page.locator('h1').count());
    assert.deepEqual(await page.evaluate(()=>[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src)),[],'broken images on '+route);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' desktop overflow');
    const broken=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));assert.deepEqual(broken,[]);
  }
  await page.goto(base+'/?utm_source=qa&utm_campaign=preservation');
  await page.locator('.nav-cta a').click();await page.waitForURL('**/start/**');
  await page.locator('#ap-first-name').fill('QA Test');await page.locator('#ap-email').fill('qa@example.com');await page.locator('#ap-message').fill('Test a managed role');await page.locator('#ap-phone-code').fill('+1');await page.locator('#ap-phone').fill('415 555 0199');
  const rowsBefore=(await (await page.request.get(base+'/__preview/rows')).json()).length;
  await page.request.post(base+'/__preview/fail-next');
  const ids=[];page.on('request',r=>{if(r.url().endsWith('/api/enquiry'))ids.push(r.postDataJSON().submission_id);});
  await page.locator('#ap-form button[type=submit]').click();await page.locator('#ap-form-error.err').waitFor();assert.equal(await page.locator('#ap-email').inputValue(),'qa@example.com');
  await page.locator('#ap-form button[type=submit]').click();await page.locator('.ap-success.ap-submitted').waitFor();assert.equal(ids[0],ids[1]);
  assert.equal(await page.locator('[data-ap-calendar="success"]').isVisible(),false);
  let rows=await (await page.request.get(base+'/__preview/rows')).json();assert.equal(rows.length,rowsBefore+1);const row=rows.at(-1);assert.equal(row.utm_source,'qa');assert.equal(row.landing_page,base+'/');assert.equal(row.cta_source,'home-header');assert.equal(row.phone_country_code,'+1');assert.equal(row.phone,'415 555 0199');
  await page.goto(base+'/start/');
  assert.equal(await page.locator('.ap-chips li').last().textContent(),'Other');
  assert.equal(await page.locator('.ap-function-link').getAttribute('href'),'#ap-form');
  await page.locator('.ap-function-link').click();
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'ap-first-name');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('pods-attribution-v2')?.includes('function-other')),true);
  await page.goto(base+'/contact/');await page.locator('#contact-name').fill('Contact Test');await page.locator('#contact-email').fill('contact@example.com');await page.locator('#contact-brief').fill('Workflow test');await page.locator('#contact-phone-code').fill('+44');await page.locator('#contact-phone').fill('207 123 4567');
  await page.evaluate(()=>{window.PODS_CONFIG={founderCalendarUrl:'https://calendar.example.test/founder'};podsEnquiry.calendar(document.querySelector('[data-enquiry-success]'));});
  await page.locator('button[type=submit]').click();await page.locator('[data-enquiry-success]:not([hidden])').waitFor();assert.equal(await page.locator('[data-founder-calendar]').getAttribute('href'),'https://calendar.example.test/founder');
  await page.goto(base+'/');
  assert.equal(await page.locator('.nav-meta').count(),0);
  await page.locator('.tab[data-pod="creative"]').click();assert.ok((await page.locator('#podTitle').textContent()).includes('creative'));
  await page.locator('.rung').nth(1).click();assert.equal(await page.locator('.rung').nth(1).getAttribute('aria-selected'),'true');
  await page.locator('.os-nav').nth(1).click();assert.ok((await page.locator('#osView').textContent()).includes('Workflow Card'));
  await page.locator('.faq-q').nth(1).click();assert.equal(await page.locator('.faq-q').nth(1).getAttribute('aria-expanded'),'true');
  await page.locator('.fn[data-fn="creative"]').click();
  assert.ok(await page.locator('.pane[data-pane="2"].on').count(),'function selection advances to support type');
  assert.equal(await page.locator('#cfgNext').isVisible(),false,'no extra Continue on single-choice step 2');
  await page.locator('.shape[data-shape="role"]').click();
  assert.ok(await page.locator('.pane[data-pane="3"].on').count(),'support type selection advances to roles');
  assert.equal(await page.locator('#cfgNext').isVisible(),true,'multi-choice role step keeps Continue');
  await page.locator('#roleList [data-a="+"]').first().click();assert.equal(await page.locator('#asmNum').textContent(),'1');
  await page.locator('#cfgNext').click();await page.locator('#cfgNext').click();await page.locator('#recCta').click();
  assert.ok((await page.locator('#recallText').textContent()).includes('Graphic Designer'));
  await page.locator('#c-local').fill('5000');await page.locator('#c-away').fill('2000');
  assert.ok((await page.locator('#outDelta').textContent()).includes('108,000'));
  await page.locator('#f-name').fill('Homepage Test');await page.locator('#f-email').fill('home@example.com');await page.locator('#f-brief').fill('Keep the configured pod');await page.locator('#f-phone-code').fill('+91');await page.locator('#f-phone').fill('9876543210');
  await page.locator('#formSubmit').click();await page.locator('[data-enquiry-success]:not([hidden])').waitFor();
  rows=await (await page.request.get(base+'/__preview/rows')).json();assert.ok(JSON.parse(rows.at(-1).pod_config).roles.includes('Graphic Designer'));
  await page.goto(base+'/');assert.ok((await page.locator('#f-brief').getAttribute('placeholder')).includes('time-zone overlap'));
  await page.goto(base+'/start/');assert.ok((await page.locator('#ap-message').getAttribute('placeholder')).includes('expected results'));
  await page.goto(base+'/contact/');assert.ok((await page.locator('#contact-brief').getAttribute('placeholder')).includes('desired outcomes'));
  await page.goto(base+'/');await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});await page.screenshot({path:'test-results/hero-desktop.png'});
  for(const width of [320,375,390,768,1024]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/start/','/contact/','/about/','/security/','/privacy-policy/','/terms-of-use/']){
      await page.goto(base+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow at '+width);
      if(route==='/'){
        await page.locator('[data-menu]').click();assert.equal(await page.locator('[data-menu]').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-menu]').getAttribute('aria-expanded'),'false');
        if(width===375)await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
      }
      if(route==='/start/'){
        const startCta=page.locator('.ap-function-link');
        await startCta.click();
        const visible=await page.evaluate(()=>{
          const form=document.getElementById('ap-form').getBoundingClientRect();
          const field=document.getElementById('ap-first-name').getBoundingClientRect();
          return {formTop:form.top,fieldTop:field.top,focus:document.activeElement?.id,screen:innerHeight};
        });
        assert.equal(visible.focus,'ap-first-name','start form input focus');
        assert.ok(visible.formTop>=0 && visible.formTop<visible.screen*.65,'form must be visible on '+width);
        assert.ok(visible.fieldTop>=0 && visible.fieldTop<visible.screen,'first input visible on '+width);
        if(width===375){await page.screenshot({path:'test-results/start-mobile.png',fullPage:true});await page.screenshot({path:'test-results/form-mobile.png'});}
      }
      if(route==='/' && width<=768){
        await page.locator('a[href="#podForm"]').last().click();
        const visible=await page.evaluate(()=>{
          const form=document.getElementById('podForm').getBoundingClientRect();
          const field=document.getElementById('f-name').getBoundingClientRect();
          return {formTop:form.top,fieldTop:field.top,focus:document.activeElement?.id,screen:innerHeight};
        });
        assert.equal(visible.focus,'f-name','home form input focus');
        assert.ok(visible.formTop>=0 && visible.formTop<visible.screen*.65,'home form visible on '+width);
        assert.ok(visible.fieldTop>=0 && visible.fieldTop<visible.screen,'home first input visible on '+width);
      }
    }
  }
  // Shared helper coalesces concurrent sends and remembers an acknowledged payload.
  await page.goto(base+'/contact/');
  await page.locator('#contact-name').fill('Concurrent Test');await page.locator('#contact-email').fill('concurrent@example.com');await page.locator('#contact-brief').fill('Duplicate guard test');await page.locator('#contact-phone-code').fill('+1');await page.locator('#contact-phone').fill('415 555 0177');
  const beforeConcurrent=(await (await page.request.get(base+'/__preview/rows')).json()).length;
  await page.evaluate(async()=>{const form=document.querySelector('form');await Promise.all([podsEnquiry.send(form,{page:'contact'}),podsEnquiry.send(form,{page:'contact'})]);await podsEnquiry.send(form,{page:'contact'});});
  assert.equal((await (await page.request.get(base+'/__preview/rows')).json()).length,beforeConcurrent+1);
  await page.locator('#contact-name').fill('   ');await page.locator('button[type=submit]').click();await page.locator('[data-form-status].err').waitFor();
  assert.equal((await (await page.request.get(base+'/__preview/rows')).json()).length,beforeConcurrent+1);
  await page.evaluate(()=>{window.PODS_CONFIG={founderCalendarUrl:'javascript:alert(1)'};podsEnquiry.calendar(document.querySelector('[data-enquiry-success]'));});
  assert.equal(await page.locator('[data-founder-calendar]').getAttribute('href'),null);
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw new Error('unavailable');}});});
  const blockedPage=await blocked.newPage();blockedPage.on('pageerror',e=>errors.push(e.message));await blockedPage.goto(base+'/contact/');assert.equal(await blockedPage.evaluate(()=>typeof podsEnquiry.send),'function');await blocked.close();
  assert.deepEqual(errors,[]);await browser.close();console.log('Browser checks passed: content/graphics preservation, 7 routes, 4 widths, attribution, retry, booking, forms and existing interactions.');
})().catch(error=>{console.error(error);process.exit(1);});
