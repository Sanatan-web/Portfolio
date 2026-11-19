/* =====================================================================
   Immersive Mode — what each station's information panel says.
   Edit freely. Any field left empty ('' or []) is simply not shown.

   project   : index into the portfolio's project list in index.html
               (0 Arivihan, 1 Peakmind, 2 EDME). It powers "View case study"
               (the existing slide viewer) and "Open prototype" (the Figma link).
               Use null when there is no case study yet.
   short     : one line for the billboard at the centre of the station
   outcomes  : big numbers shown as tiles — { value:'+83%', label:'...' }
   ===================================================================== */
window.IMM_CONTENT={
  stations:[
    {
      id:'arivihan', num:'01', name:'Arivihan', kicker:'EdTech · AI learning', accent:'#19b3a1', project:0,
      short:'Redesigning Arivihan’s AI Ask Doubt chatbot to increase engagement and retention.',
      summary:'Redesigning Arivihan’s AI to increase engagement and retention. Arivihan helps students learn through live classes and self-paced study; I rebuilt its LLM-powered AI Ask Doubt chatbot after interviewing more than 15 students.',
      role:'Product Designer and Owner', duration:'5 days (April 2026)',
      challenges:[
        'Rebuild the AI Ask Doubt chatbot around how students actually ask for help'
      ],
      decisions:[
        'Grounded the redesign in 15+ student interviews',
        'A new conversation flow and prompt interface',
        'Prototyped as working code in Claude Code'
      ],
      outcomes:[
        {value:'+83%', label:'D30 feature retention'},
        {value:'+147%', label:'Conversations per active student'},
        {value:'+126%', label:'Messages per session'}
      ]
    },
    {
      id:'peakmind', num:'02', name:'Peakmind', kicker:'Student mental wellness', accent:'#5fb36a', project:1,
      short:'Shaping the product of Peakmind, a student mental wellness platform, over 18 months.',
      summary:'Shaping the product of Peakmind, a student mental wellness platform. I led its product design for 18 months, combining user research, product strategy and visual design.',
      role:'Product Designer', duration:'18 months (Feb 2024 – Aug 2025)',
      challenges:[],
      decisions:[
        'Redesigned the chatbot across conversation, character and UI',
        'Designed the app UI, visuals and dashboards',
        'Created the motion graphics'
      ],
      outcomes:[
        {value:'+37%', label:'Average session time'}
      ]
    },
    {
      id:'edme', num:'03', name:'EDME Insurance', kicker:'HR insurance · Enterprise', accent:'#f0a01c', project:2,
      short:'Designing a smarter HR insurance platform: mobile and web across 10+ insurance modules.',
      summary:'Designing a smarter HR insurance platform for EDME (formerly Aditya Birla Insurance): mobile and web experiences across more than 10 insurance modules.',
      role:'Product Designer', duration:'3.5 months (Jul – Oct 2025)',
      challenges:[
        'Complex insurance data and workflows spread across 10+ modules'
      ],
      decisions:[
        'Simplified complex data and workflows into intuitive, user-friendly interfaces',
        'Designed for both mobile and web'
      ],
      outcomes:[
        {value:'10+', label:'Insurance modules designed'}
      ]
    },
    {
      id:'works', num:'04', name:'Other Works', kicker:'Motion · Design · Web · Code', accent:'#b07cff', project:null,
      short:'Motion design, more interface work, Framer websites and vibe-coded projects.',
      summary:'Beyond the case studies: motion design, more interface work, websites built in Framer and things I vibe-coded.',
      role:'', duration:'',
      challenges:[], decisions:[], outcomes:[],
      // each opens the matching gallery from the side-view site (the WORKS list in index.html)
      works:[
        {key:'motion',  label:'Motion works',     color:'#ff6a5a', desc:'Sleep Zone and the Peakoo chatbot for Peakmind, the practice feature for Arivihan, and personal work'},
        {key:'designs', label:'More designs',     color:'#b07cff', desc:'Interface explorations: Atelier, Adaptive Practice, Bloom and more'},
        {key:'framer',  label:'Framer works',     color:'#3a8bff', desc:'shopandsource.com and deltaoptix.com, built in Framer'},
        {key:'vibe',    label:'Vibecoding works', color:'#3ee08a', desc:'thefallenheroes.in, with more on the way'}
      ]
    }
  ]
};
