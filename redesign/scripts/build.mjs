import {mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

const outRoot = resolve('redesign/preview');
const base = '/redesign/preview/';
const assets = '/redesign/assets/';
const logo = 'https://cdn.prod.website-files.com/680e8cf49bf5c7568993a036/68105e228dad96121b072128_Away%20Logo%20Signal%20Orange%20(2).svg';
const today = '2026';

const url = path => base + path;
const navLinks = [
  ['how-it-works/','How it works'],
  ['roles/','What we can do'],
  ['#space','The workspace'],
  ['pricing/','Pricing'],
  ['about/','About']
];
const nav = active => `
  <a class="skip" href="#main">Skip to content</a>
  <div class="preview-note">INTERNAL DESIGN PREVIEW · NOT THE LIVE WEBSITE</div>
  <header class="nav">
    <div class="wrap nav-in">
      <a class="brand" href="${url('')}" aria-label="away Pods home"><img src="${logo}" alt="away"><small>Pods</small></a>
      <nav class="nav-links" id="primary-navigation" data-nav-links aria-label="Primary navigation">
        ${navLinks.map(([href,label])=>`<a href="${href.startsWith('#') ? url('') + href : url(href)}" ${active === href ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
      </nav>
      <a class="btn btn-orange nav-cta" href="${url('start/')}">Tell us the work <span aria-hidden="true">↗</span></a>
      <button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false" data-menu>Menu</button>
    </div>
  </header>`;
const footer = () => `
  <footer class="footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a href="${url('')}" aria-label="away Pods home"><img class="logo" src="${logo}" alt="away"></a>
          <p class="footer-tag">A way to work.<br><em>A way to grow.</em></p>
          <p class="mini" style="max-width:280px;color:#b9c4c1">away Pods is a developing service by the people behind away.center.</p>
        </div>
        <div><h4>Explore</h4>
          <a href="${url('how-it-works/')}">How it works</a><a href="${url('roles/')}">Roles and workflows</a><a href="${url('pricing/')}">Pricing approach</a><a href="${url('about/')}">About us</a>
        </div>
        <div><h4>Get in touch</h4>
          <a href="${url('contact/')}">Contact away Pods</a><a href="${url('start/')}">Tell us your role</a><a href="${url('security/')}">Data and operations</a><a href="https://www.away.center/" target="_blank" rel="noopener">away.center ↗</a>
        </div>
        <div><h4>Information</h4>
          <a href="${url('privacy-policy/')}">Privacy policy <small>(draft)</small></a><a href="${url('terms-of-use/')}">Terms of use <small>(draft)</small></a>
          <a href="https://www.away.center/careers" target="_blank" rel="noopener">Careers at away ↗</a>
        </div>
      </div>
      <div class="footer-meta"><span>© ${today} away · India</span><span>Built with care, in Bangalore.</span></div>
    </div>
  </footer>`;
const shell = ({title,description,active='',body}) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · away Pods</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#FAF8F4">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="${assets}site.css">
  <script defer src="/enquiry.js"></script>
  <script defer src="${assets}site.js"></script>
</head>
<body>
${nav(active)}
<main id="main">${body}</main>
${footer()}
</body>
</html>`;
const eyebrow = label => `<div class="eyebrow"><span class="tiny-label">${label}</span></div>`;
const workIcons = [
  ['open-workstation.png','A real place to work','A desk, people on the floor, and space designed for focus. No remote-office setup for you to manage.'],
  ['meeting-room.png','A working rhythm','A shared way to define roles, agree priorities, review work and report progress.'],
  ['cabins.png','Someone responsible','Hiring support, local coordination and continuity designed around the agreed scope.']
];
const models = [
  ['01 / A role','Managed Role','One dedicated India-based person with sourcing, workspace and agreed support.','1 person'],
  ['02 / A process','Managed Workflow','A repeatable workstream with SOPs, output checks and a reporting rhythm.','Defined outputs'],
  ['03 / A team','Managed Pod','Two to four people coordinated around a function or set of recurring tasks.','2–4 people'],
  ['04 / A capability','Nano GCC','A larger India operating unit, built around your business and scaled deliberately.','5–15+ people']
];
const modelsMarkup = () => `<div class="model-stack">${models.map(([number,name,desc,scale])=>`
  <article class="model"><b>${number}</b><h3>${name}</h3><p>${desc}</p><small>${scale}</small></article>`).join('')}</div>`;
const faqItems = [
  ['Can we start with one person?','Yes. You can begin by defining one role. It does not have to start as an entire offshore department.'],
  ['Who chooses the person we hire?','You choose the final hire. away supports the search and assessment process, while we agree how interviews and approvals will work.'],
  ['Where will the team work?','The initial delivery concept is based at an away centre in Bangalore, India. We will confirm the specific setup for each engagement.'],
  ['Who handles payroll and legal employment?','The employment structure may be through a client entity or an agreed provider such as an employer-of-record service. The final arrangement and responsibilities will be confirmed in the proposal and contracts.'],
  ['How do we know what is happening?','We intend to define roles or workflows, responsibilities, and a regular reporting cadence with you. Exact tools, metrics and service commitments are agreed before any engagement begins.'],
  ['What happens if someone leaves?','Continuity planning, documented context, and replacement arrangements are part of the proposed model. The specific terms will be set out in your agreement.']
];
const faqMarkup = items => items.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}</summary><p>${a}</p></details>`).join('');
const formMarkup = ({title='What work would you like off your plate?',submit='Send enquiry ↗'}={}) => `
  <div class="form-card">
    <h2>${title}</h2>
    <form action="/api/enquiry" method="post" data-enquiry-form>
      <div class="field-grid">
        <div class="field"><label for="name">Your name *</label><input id="name" name="name" autocomplete="name" maxlength="120" required placeholder="First and last name"></div>
        <div class="field"><label for="email">Work email *</label><input id="email" type="email" name="email" autocomplete="email" maxlength="254" required placeholder="you@company.com"></div>
        <div class="field full"><label for="company">Company (optional)</label><input id="company" name="company" autocomplete="organization" maxlength="160" placeholder="Your business"></div>
        <div class="field full"><label for="brief">What do you need help with? *</label><textarea id="brief" name="brief" required maxlength="5000" placeholder="A role, a repetitive workflow, a whole team, or a problem you haven't quite defined yet."></textarea></div>
      </div>
      <div class="form-foot">
        <p>We'll use your details to respond to this enquiry. Read our <a href="${url('privacy-policy/')}">draft privacy notice</a>; the final policy requires legal approval before launch.</p>
        <button class="btn btn-orange" type="submit">${submit}</button>
      </div>
      <p class="form-status" data-form-status role="status" aria-live="polite"></p>
    </form>
  </div>`;
const innerHero = ({label,title,intro})=>`<section class="inner-hero"><div class="wrap">${eyebrow(label)}<h1>${title}</h1><p>${intro}</p></div></section>`;

const home = `
  <section class="hero">
    <div class="hero-copy">
      ${eyebrow('Introducing away Pods / Bangalore')}
      <h1>Build your team in India.<br><em>Not an India office.</em></h1>
      <p class="hero-body">We help you find the right people, give them a real place to work, and build a reliable operating rhythm around the work. You choose the people and stay in control.</p>
      <div class="cta-pair"><a class="btn btn-orange" href="${url('start/')}">Let's talk about the work <span aria-hidden="true">↗</span></a><a class="btn btn-line" href="#how">See the idea <span aria-hidden="true">↓</span></a></div>
      <div class="hero-notes"><span><i></i>Start with one role</span><span><i></i>Based in Bangalore</span><span><i></i>Designed by away.center</span></div>
    </div>
    <div class="hero-art">
      <img src="${assets}operating-studio.svg" alt="Editorial illustration of a team working together in a studio">
      <span class="art-sticker">Your team.<br>Our space.<br>One rhythm.</span>
      <span class="art-index">PLATE 01 / PEOPLE + PLACE</span>
    </div>
  </section>
  <div class="ribbon" aria-label="Our model in brief"><div class="ribbon-track"><span>People <b>✳</b> A place to work</span><span>Work you can see <b>✳</b> Local support</span><span>Built around your business <b>✳</b></span></div></div>
  <section class="intro" id="how"><div class="wrap">
    <div class="intro-grid">
      <div>${eyebrow('01 / The idea')}<h2 class="section-h">Hiring is one part.<br><em>Making it work</em><br>is the rest.</h2></div>
      <div class="intro-side"><p class="lead">A good hire needs more than a job description and a laptop. You need the right person, a consistent environment, a clear way to work together and someone locally who can help hold it together.</p><p class="intro-quote">“We hire, house and help run your team in India.”</p><a class="btn btn-line" href="${url('how-it-works/')}">Explore how it works ↗</a></div>
    </div>
    <div class="card-three">${workIcons.map(([icon,title,desc],i)=>`<article class="value-card"><div class="value-no">0${i+1} / THE MODEL</div><img class="icon-art" src="${assets}brand/${icon}" alt="" aria-hidden="true"><div><h3>${title}</h3><p>${desc}</p></div></article>`).join('')}</div>
  </div></section>
  <section class="split-band" id="space">
    <div class="split-figure"><img class="figure-floor" src="${assets}operating-studio.svg" alt="Illustrated work environment with desks and people"><div class="figure-caption">No location photography in this version. The workspace story is shown through branded illustration.</div></div>
    <div class="split-copy">${eyebrow('02 / A real base')}<h2 class="section-h">Not a profile<br>on a screen.<br><em>A place to work.</em></h2><p class="lead">The first away Pods concept is built around our existing Bangalore workspace. A designed place for the everyday work, coordination and conversations that make a team a team.</p>
      <div class="rule-list"><div class="rule-row"><b>Workspace</b><span>Already part of the away world</span></div><div class="rule-row"><b>People</b><span>Hired around your requirements</span></div><div class="rule-row"><b>Routines</b><span>Defined before work begins</span></div></div>
    </div>
  </section>
  <section class="roles-section" id="roles"><div class="wrap">
    <div class="roles-top"><div>${eyebrow('03 / What this could look like')}<h2 class="section-h">What needs<br><em>doing?</em></h2></div><p class="lead">You don't need to name the right operating model. Tell us where work is piling up. Here are examples of the kinds of roles and workflows we can explore together.</p></div>
    <div class="roles-layout">
      <div class="role-tabs" role="tablist" aria-label="Types of work">
        <button class="role-tab active" id="role-operations" data-role-tab="operations" role="tab" aria-selected="true" aria-controls="role-panel">Back-office & operations</button>
        <button class="role-tab" id="role-sales" data-role-tab="sales" role="tab" aria-selected="false" aria-controls="role-panel">Sales support</button>
        <button class="role-tab" id="role-customer" data-role-tab="customer" role="tab" aria-selected="false" aria-controls="role-panel">Customer experience</button>
        <button class="role-tab" id="role-marketing" data-role-tab="marketing" role="tab" aria-selected="false" aria-controls="role-panel">Marketing operations</button>
        <button class="role-tab" id="role-creative" data-role-tab="creative" role="tab" aria-selected="false" aria-controls="role-panel">Design & creative</button>
        <button class="role-tab" id="role-engineering" data-role-tab="engineering" role="tab" aria-selected="false" aria-controls="role-panel">Engineering & AI</button>
      </div>
      <div class="role-panel" id="role-panel" role="tabpanel" aria-live="polite" aria-labelledby="role-operations">
        <div class="role-panel-copy"><span class="tiny-label">Possible starting point / <span data-role-number>01</span></span><h3 data-role-title>Back-office & operations</h3><p class="muted" data-role-description>An example starting point for companies with admin-heavy weeks, busy inboxes, and processes that need consistent follow-through.</p><ul data-role-tasks><li>CRM and data upkeep</li><li>Order or ticket administration</li><li>Scheduling and recurring reporting</li></ul></div>
        <div class="role-visual"><small data-role-tag>Make recurring work dependable</small><strong aria-hidden="true">↗</strong></div>
      </div>
    </div>
    <p class="mini muted" style="margin-top:18px">Examples, not a catalogue of staffed teams. Every arrangement depends on scope, availability and fit.</p>
  </div></section>
  <section class="process"><div class="wrap">
    <div class="process-head"><div>${eyebrow('04 / From an idea to a team')}<h2 class="section-h">Four steps.<br><em>No mystery.</em></h2></div><p class="lead">We start with the actual work, not a pre-packaged seat count. This is the proposed route from an initial conversation to a functioning setup.</p></div>
    <div class="steps"><article class="step"><div class="step-num">01</div><h3>Tell us the work.</h3><p>What takes your time, how it runs today, and where you need consistent help.</p></article>
    <article class="step"><div class="step-num">02</div><h3>Design the role.</h3><p>Agree responsibilities, tools, working hours, evaluation criteria, and the right operating arrangement.</p></article>
    <article class="step"><div class="step-num">03</div><h3>Choose your hire.</h3><p>We help source and evaluate candidates. You interview and make the final selection.</p></article>
    <article class="step"><div class="step-num">04</div><h3>Build the rhythm.</h3><p>Set up workspace, process documentation, reporting and the agreed local support.</p></article></div>
  </div></section>
  <section class="paperwork"><div class="wrap paper-grid">
    <div>${eyebrow('05 / Visibility, without the theatre')}<h2 class="section-h">You should know<br><em>what is happening.</em></h2><p class="lead">Our proposed operating layer starts with simple things: a clear role, agreed work, the tools you already use, and a regular written update. No magic dashboard is required.</p><p class="mini muted">The panel here is a concept illustration of reporting structure, not a report from an existing Pods client.</p></div>
    <div class="paper-card"><div class="paper-top"><span>Example weekly view</span><span>01 / 04</span></div><h3>Clarity, in one place.</h3>
      <div class="paper-row"><span>What was agreed</span><b>Priorities & expected outcomes</b></div>
      <div class="paper-row"><span>What got done</span><b>Completed work & handoffs</b></div>
      <div class="paper-row"><span>What needs attention</span><b>Blockers & decisions</b></div>
      <div class="paper-row"><span>What comes next</span><b>Next week's focus</b></div>
      <small>Illustrative reporting format • final cadence and scope agreed with each client.</small>
    </div>
  </div></section>
  <section class="models"><div class="wrap">${eyebrow('06 / Start at the right size')}<h2 class="section-h">One person now.<br><em>A team when you're ready.</em></h2>
    ${modelsMarkup()}
    <p class="mini muted" style="margin-top:24px">These are four ways to define responsibility, not four compulsory steps. <a href="${url('pricing/')}">See how the pricing approach works ↗</a></p>
  </div></section>
  <section class="assurance"><div class="wrap assurance-grid"><div>${eyebrow('07 / A clear division of work')}<h2 class="section-h">Your business.<br><em>Your call.</em></h2><p class="lead">You retain final hiring approval, priorities and business direction. Our responsibility depends on the service scope we agree, including the workplace and operational support.</p></div>
    <div class="assurance-list"><div class="assurance-item"><strong>You select the person.</strong><span>01 / Hiring</span></div>
    <div class="assurance-item"><strong>You own priorities and approvals.</strong><span>02 / Direction</span></div>
    <div class="assurance-item"><strong>We coordinate the agreed local layer.</strong><span>03 / Operations</span></div>
    <div class="assurance-item"><strong>Employment and compliance roles are defined in writing.</strong><span>04 / Clarity</span></div></div>
  </div></section>
  <section class="faq-cta"><div class="wrap faq-grid"><div>${eyebrow('08 / Good questions')}<h2 class="section-h">Before we<br><em>begin.</em></h2><p class="lead">When you build a team abroad, the practical questions matter more than the brochure.</p></div><div>${faqMarkup(faqItems)}</div></div></section>
  <section class="big-cta"><div class="wrap">${eyebrow('A conversation is a good start')}<h2 class="section-h">Tell us what<br><em>you need done.</em></h2><a href="${url('start/')}" class="btn">Let's talk about the work ↗</a></div></section>`;

const start = `<section class="start-hero"><div class="wrap start-layout">
  <div>${eyebrow("Let's start with the work")}<h1 class="section-h">A role?<br>A workflow?<br><em>A whole team?</em></h1><p class="lead">Tell us what you need done. We'll help work through whether away Pods could be the right fit, and how to start without setting up an office in India.</p>
    <div class="start-bullets"><span>Start with one person</span><span>You approve the final hire</span><span>Workspace and local support are part of the model</span></div>
  </div>
  ${formMarkup({title:'Tell us a little about the work.'})}
</div></section>
<section class="process"><div class="wrap">${eyebrow('What happens next')}<h2 class="section-h">A practical first conversation.</h2>
  <div class="steps"><article class="step"><div class="step-num">01</div><h3>You describe the need.</h3><p>Even if it's rough, start with the tasks and responsibilities.</p></article>
  <article class="step"><div class="step-num">02</div><h3>We clarify the role.</h3><p>We discuss scope, timelines, work hours and your existing tools.</p></article>
  <article class="step"><div class="step-num">03</div><h3>We outline a route.</h3><p>A proposed hiring and operating approach, where it makes sense.</p></article>
  <article class="step"><div class="step-num">04</div><h3>You decide.</h3><p>No obligation to go forward from an enquiry.</p></article></div>
</div></section>
<section class="faq-cta"><div class="wrap faq-grid"><div>${eyebrow('Quick answers')}<h2 class="section-h">Still thinking<br><em>it through?</em></h2></div><div>${faqMarkup(faqItems.slice(0,5))}</div></div></section>`;

const how = `${innerHero({label:'A simple operating model',title:'Your work, done in India.<br><em>Without the extra machinery.</em>',intro:'We are designing away Pods around three things: thoughtful hiring, a real workspace, and day-to-day operating visibility.'})}
  <section class="process"><div class="wrap">${eyebrow('The proposed path')}<h2 class="section-h">From brief to rhythm.</h2><div class="steps">
    <article class="step"><div class="step-num">01</div><h3>Define</h3><p>We understand the work, your tools, the outcomes and the desired overlap in working hours.</p></article>
    <article class="step"><div class="step-num">02</div><h3>Assess</h3><p>We design the search and evaluation around critical reasoning, job-specific capability and fit.</p></article>
    <article class="step"><div class="step-num">03</div><h3>Set up</h3><p>Once you choose the person, we set up the agreed workspace, operations and reporting approach.</p></article>
    <article class="step"><div class="step-num">04</div><h3>Support</h3><p>We coordinate the local layer included in your agreement and review what needs improving.</p></article>
  </div></div></section>
  <section class="split-band"><div class="split-figure"><img class="figure-floor" src="${assets}operating-studio.svg" alt="Illustration of an office team working together"></div>
    <div class="split-copy">${eyebrow('Who does what')}<h2 class="section-h">Control stays<br><em>with you.</em></h2><div class="rule-list">
      <div class="rule-row"><b>Business direction</b><span>You</span></div><div class="rule-row"><b>Final hire approval</b><span>You</span></div><div class="rule-row"><b>Sourcing and assessment</b><span>away, as scoped</span></div><div class="rule-row"><b>Workspace and coordination</b><span>away, as scoped</span></div><div class="rule-row"><b>Legal employment and payroll</b><span>Agreed structure / EOR or entity</span></div><div class="rule-row"><b>Outputs and decisions</b><span>Agreed together</span></div>
    </div></div></section>
  <section class="models"><div class="wrap">${eyebrow('Four ways to begin')}<h2 class="section-h">The right shape<br><em>for the work.</em></h2>${modelsMarkup()}</div></section>
  <section class="big-cta"><div class="wrap"><h2 class="section-h">Start with the<br><em>real problem.</em></h2><a class="btn" href="${url('start/')}">Let's discuss it ↗</a></div></section>`;

const roles = `${innerHero({label:'Roles and workflows',title:'The work that keeps<br><em>a business moving.</em>',intro:'Whether you need one capable person or a recurring function covered, these are starting points for an honest conversation—not promises of ready-made teams.'})}
<section class="roles-section"><div class="wrap"><div class="card-three">
  ${[
    ['Operations & admin','Scheduling, data quality, recurring tasks and cross-team coordination.'],
    ['Sales support','Prospecting research, CRM care, follow-up coordination and pipeline operations.'],
    ['Customer support','Email, chat, ticket triage, escalation documentation and support routines.'],
    ['Marketing operations','Campaign coordination, reporting, publishing and QA.'],
    ['Design & creative','Asset production, presentations, content design and production support.'],
    ['Engineering & AI','Software, testing, technical QA and well-defined automation workflows.']
  ].map(([name,desc],i)=>`<article class="value-card"><span class="value-no">0${i+1} / FUNCTION</span><div><h3>${name}</h3><p>${desc}</p></div></article>`).join('')}
</div><p class="lead" style="margin-top:44px">Our first question isn't “which package?” It is “what needs to work better in your business?”</p>
<a class="btn btn-orange" href="${url('start/')}">Describe your role ↗</a></div></section>`;

const pricing = `${innerHero({label:'Pricing and scope',title:'One monthly figure.<br><em>Agreed before we begin.</em>',intro:'We are keeping the live site’s current custom-quote approach. Your price depends on the role, experience, setup and how much operating responsibility you want us to take.'})}
<section class="models"><div class="wrap">${eyebrow('Our four models')}<h2 class="section-h">A proposal around<br><em>your work.</em></h2>${modelsMarkup()}
<div class="inner-grid"><div><h3 class="subhead">What can be included?</h3><p class="lead">Recruiting and assessment support, access to an away workspace, equipment setup, operational documentation, reporting and continuity support, depending on the agreed model.</p></div><div><h3 class="subhead">What we won't invent.</h3><p class="lead">A universal price per employee or a fixed savings claim before we know your role, the employment arrangement and what will actually be managed.</p></div></div>
</div></section>
<section class="big-cta"><div class="wrap"><h2 class="section-h">Let's put a real<br><em>scope together.</em></h2><a class="btn" href="${url('start/')}">Ask for an approach and quote ↗</a></div></section>`;

const about = `${innerHero({label:'People behind the idea',title:'Built by people<br><em>who build places to work.</em>',intro:'away Pods is an emerging service from away.center, a design-led workspace brand with physical centres in India.'})}
<section class="inner-grid wrap"><div>${eyebrow('The thinking')}<h2 class="section-h">A better workday<br><em>is infrastructure.</em></h2></div><div><p class="lead">Our founder, Udbhav Jalan, has been working in the shared-workspace industry since 2017. The idea for Pods comes from a simple observation: if a company wants to build a small team in India, the person and the desk are only part of the equation.</p><p class="lead">We want to bring together hiring, space, everyday working habits, local coordination and a clear division of responsibility under one practical service.</p><p class="mini muted">away Pods is still being prepared for launch. Existing away workspace clients are not represented here as Pods customers.</p></div></section>
<section class="split-band"><div class="split-figure"><img class="figure-floor" src="${assets}operating-studio.svg" alt="Illustration of a team and workspace"></div><div class="split-copy">${eyebrow('Built from Bangalore')}<h2 class="section-h">A physical base.<br><em>A human touch.</em></h2><p class="lead">Away's Koramangala workspace is the starting point for how we imagine the product. The quality of the everyday environment matters, not as decoration, but as part of the operating foundation.</p><a class="btn btn-line" href="https://www.away.center/bangalore">Explore away Bangalore ↗</a></div></section>`;

const security = `${innerHero({label:'A transparent operating model',title:'Trust begins with<br><em>clear responsibilities.</em>',intro:'The exact legal, security and operating controls will depend on the role and the final agreement. This page explains the questions we believe must be answered before work begins.'})}
<section class="wrap content-prose"><div class="legal-notice"><strong>Review note:</strong> This is a design-stage explainer, not a claim of completed security certification or a contractual assurance. The controls below must be verified against the operating service before publication.</div>
<h2>Access to your tools and information</h2><p>We intend to agree who creates user accounts, what applications the team can use, how access is granted, and what happens when a role changes or ends. The client retains authority over its own systems.</p>
<h2>Devices and the workplace</h2><p>The proposal should define whether equipment is supplied by away or the client, the workspace arrangement, security configuration, and procedures for device return or replacement.</p>
<h2>Confidentiality and intellectual property</h2><p>These responsibilities need to be addressed in the actual contracts, including any employment or EOR arrangements. We will not imply that one general website statement settles IP ownership.</p>
<h2>Continuity and reporting</h2><p>Role documentation, reporting cadence, backup context and replacement provisions will be scoped with each customer. Any specific timelines or guarantees belong in a signed service agreement.</p>
<p><a class="btn btn-orange" href="${url('contact/')}">Ask a practical question ↗</a></p></section>`;

const contact = `${innerHero({label:'We’re listening',title:'Tell us what you<br><em>have in mind.</em>',intro:'You don’t need a complete hiring plan. Tell us the work you’re thinking about moving to India, and we can work through the shape together.'})}
<section class="wrap contact-grid"><div>${eyebrow('away Pods / Bangalore')}<h2 class="section-h">A good conversation<br><em>comes first.</em></h2><p class="lead">We are preparing the service and welcome conversations about future requirements. Our physical starting point is the away centre in Koramangala, Bangalore.</p><p class="mini muted">For general away workspace enquiries, visit <a href="https://www.away.center/contact-us">away.center/contact-us</a>. This form is for Pods.</p></div>${formMarkup()}</section>`;

const privacy = `${innerHero({label:'Policy for review',title:'Privacy <em>policy.</em>',intro:'A dedicated privacy policy for away Pods is required before we publish the new website. This draft identifies the processing already visible in the website code and the decisions still to be verified.'})}
<section class="wrap content-prose"><div class="legal-notice"><strong>Draft, not approved for publication.</strong> Please provide the responsible legal entity, registered address, privacy contact, service providers, analytics inventory and retention schedule so this can be finalised and legally reviewed.</div>
<h2>Information sent through the enquiry form</h2><p>The form asks for your name, business email, optional company name and a description of your work requirement. The website also collects the landing page and campaign parameters with the submission. These details are used to respond to the enquiry and understand the source of interest.</p>
<h2>Storage and processors</h2><p>The identity of the data controller, hosting and email/CRM processors, retention period, cross-border transfers and contact for privacy requests must be confirmed before this document can serve as a published privacy notice.</p>
<h2>Analytics and cookies</h2><p>Any analytics or advertising tags should be inventoried, disclosed and configured with whatever notices and consent choices are legally required for the visitors we serve.</p>
<h2>Contact</h2><p>Until the legal operator and dedicated privacy contact are approved, visitors can use the <a href="${url('contact/')}">Pods contact form</a>. A final policy will display direct legal contact details.</p></section>`;

const terms = `${innerHero({label:'Website terms for review',title:'Terms of <em>use.</em>',intro:'This page is for the public marketing website, not for the eventual Pods service agreement between a customer and the operating company.'})}
<section class="wrap content-prose"><div class="legal-notice"><strong>Draft, not approved for publication.</strong> Legal entity, governing law, permitted website use, intellectual-property ownership and liability language require counsel review before launch.</div>
<h2>Information on this website</h2><p>Website content describes a service in development. Descriptions, illustrations and operating arrangements are explanatory and do not amount to an employment offer, committed service level, or price quotation.</p>
<h2>Service contracts</h2><p>Any actual engagement requires an agreed proposal and contract defining scope, responsibility, price, confidentiality, employment structure and other relevant terms.</p>
<h2>Third-party links</h2><p>Links may lead to away.center or third-party providers. Their own terms and privacy policies apply to their services.</p>
<h2>Contact</h2><p>Questions about this website can be sent through <a href="${url('contact/')}">our contact page</a>. The final terms will identify the legal owner and required contact details.</p></section>`;

const pages = [
  ['', 'Build your India team', 'away Pods helps companies explore hiring, workspace and operations for a team in India, starting in Bangalore.', home],
  ['start/', 'Start your India team', 'Talk to away Pods about the role, workflow or India team you need to build.', start],
  ['how-it-works/', 'How away Pods works', 'Explore the proposed hiring, workspace and operating model behind away Pods.', how],
  ['roles/', 'Roles and workflows', 'Explore possible roles and business workflows for an India team with away Pods.', roles],
  ['pricing/', 'Pricing approach', 'Custom-quote pricing for Managed Roles, Workflows, Pods and Nano GCC services.', pricing],
  ['about/', 'About away Pods', 'Meet the idea and the workspace experience behind away Pods, from away.center.', about],
  ['security/', 'Security and responsibilities', 'How away Pods approaches operating responsibilities, confidentiality and access, subject to contract.', security],
  ['contact/', 'Contact away Pods', 'Get in touch about building a role, workflow or team in India with away Pods.', contact],
  ['privacy-policy/', 'Privacy policy draft', 'Design-stage privacy policy pending legal approval.', privacy],
  ['terms-of-use/', 'Terms of use draft', 'Design-stage website terms pending legal approval.', terms]
];

for (const [path,title,description,body] of pages) {
  const target = join(outRoot,path);
  mkdirSync(target,{recursive:true});
  writeFileSync(join(target,'index.html'),shell({title,description,active:path,body}).replace(/[ \t]+$/gm,''),'utf8');
}
console.log(`Built ${pages.length} pages into ${outRoot}`);
