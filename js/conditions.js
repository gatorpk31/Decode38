// ==================================================================
// Decode38 -- Condition Step Definitions (26 Conditions)
// ==================================================================
Decode38.Conditions = (function() {
  'use strict';

  // -- Service Background Steps (always first) --------------------
  function _serviceSteps() {
    return [{
      id: 'service',
      label: 'Service Background',
      title: 'Your Military Service',
      desc: 'This information helps establish eligibility and applies the correct standards based on your service status. All service types are covered — active duty, National Guard, and Reserve.',
      fields: [
        { id:'branch', label:'Branch of Service', type:'radio',
          options:['Army','Navy','Marine Corps','Air Force','Space Force','Coast Guard','National Guard (Army)','National Guard (Air)','Army Reserve','Navy Reserve','Marine Corps Reserve','Air Force Reserve','Coast Guard Reserve'] },
        { id:'service_status', label:'Current or most recent service status', type:'radio',
          options:['Active Duty — currently serving','Active Duty — separated/retired','National Guard / Reserve — federal activation (Title 10)','National Guard / Reserve — state activation (Title 32)','National Guard / Reserve — not activated, drilling status','National Guard / Reserve — separated/retired','Other / Veteran (fully separated)'],
          info:'Your service status affects which VA benefits you qualify for and how your claim is evaluated. Guard and Reserve members on federal orders (Title 10) are treated the same as active duty.' },
        { id:'service_start', label:'Start of most recent period of service', type:'text', placeholder:'e.g. March 2008' },
        { id:'service_end', label:'End of most recent period of service', type:'text', placeholder:'e.g. November 2018 — or "Currently serving"' },
        { id:'mos', label:'Primary MOS / AFSC / Rating / NEC', type:'text', placeholder:'e.g. 11B Infantryman, 68W Combat Medic, 0311 Rifleman', info:'Your job code helps establish exposure risk for many conditions.' },
        { id:'deployments', label:'Deployment locations (list all that apply)', type:'text', placeholder:'e.g. Iraq 2010-2011, Afghanistan 2013, Kuwait 2015', info:'Certain locations trigger presumptive service connection (PACT Act, Agent Orange, Gulf War illness).' },
        { id:'discharge_type', label:'Discharge / Separation character (if separated)', type:'radio',
          options:['Honorable','General (Under Honorable Conditions)','Other Than Honorable (OTH)','Bad Conduct','Dishonorable','Still serving — not separated','N/A (Guard/Reserve in drilling status)'],
          info:'Honorable and General discharges qualify for VA benefits. OTH may be upgraded — a VSO can help.' },
        { id:'prior_va_rating', label:'Do you have an existing VA compensation rating?', type:'radio',
          options:['No — this is my first claim','Yes — and I am seeking increases or new conditions','Yes — I was rated but want to re-evaluate'] },
        { id:'current_combined_rating', label:'Current combined VA compensation rating (if any)', type:'text', placeholder:'e.g. 70% — or leave blank', optional:true }
      ]
    }];
  }

  // -- Final Context Steps (always last) -------------------------
  function _contextSteps() {
    return [{
      id: 'context',
      label: 'Final Context',
      title: 'Additional Context',
      desc: 'A few final questions that affect your overall claim picture.',
      fields: [
        { id:'nexus_evidence', label:'What evidence do you have that connects your conditions to service?', type:'checkbox',
          options:['Service treatment records (STRs) showing in-service diagnosis or treatment','Post-separation medical records showing continuity','Buddy statements from fellow service members','Personal statement','Nexus letter from private doctor','VA C&P exam already completed','No current evidence — need to build this'] },
        { id:'vso_help', label:'Do you have a VSO, attorney, or claims agent helping you?', type:'radio',
          options:['Yes — VSO (DAV, VFW, American Legion, etc.)','Yes — accredited claims agent','Yes — VA-accredited attorney','No — filing on my own','No — planning to find one'] },
        { id:'claim_intent', label:'What is your primary goal with this tool?', type:'radio',
          options:['Understand my rating before I file','Learn the right language to describe my conditions','Prepare for a C&P exam','Help a family member or fellow veteran','Educational — general research'] }
      ]
    }];
  }

  // -- Condition Step Definitions --------------------------------
function getConditionSteps(cond) {
  var steps = [];

  if (cond === 'ptsd') {
    steps.push({
      id:'ptsd_stressor', label:'PTSD — Stressor', title:'PTSD: In-Service Stressor',
      conditionLabel:'PTSD / Mental Health',
      desc:'The VA requires a connection between your PTSD and a specific in-service event. You do not need to share detailed descriptions — a general description helps but is not required.',
      fields:[
        { id:'ptsd_stressor_type', label:'Type of stressor your PTSD claim is based on', type:'radio',
          options:['Combat / direct enemy engagement or hostile fire','Military Sexual Trauma (MST)','Non-combat traumatic event (accident, explosion, death of fellow service member)','Cumulative operational stress (multiple deployments, chronic exposure)','Prisoner of War (POW)','Other traumatic event during service'],
          info:'For combat veterans, service in a recognized combat zone is sufficient to establish the stressor without detailed documentation.' },
        { id:'ptsd_stressor_desc', label:'Brief description of the in-service event or exposure', type:'textarea',
          placeholder:'e.g. "Deployed to Afghanistan 2011-2012, sustained indirect fire, experienced IED blasts, witnessed casualties." General description is sufficient.' },
        { id:'ptsd_inservice_tx', label:'Were you treated for mental health issues while in service?', type:'radio',
          options:['Yes — formal medical record / mental health visit','Yes — informal (chaplain, peer support, behavioral health screening)','No — I did not seek treatment in service','No — I avoided it due to stigma or career concerns'],
          info:'Many service members avoid formal treatment due to career concerns. This is noted by VA raters and does not hurt your claim.' },
        { id:'ptsd_onset', label:'When did PTSD symptoms first appear?', type:'radio',
          options:['During active service','Within 1 year of separation or end of activation','1-5 years after separation','More than 5 years after separation','Gradually — hard to pinpoint a start date'] },
        { id:'ptsd_diagnosis', label:'Current diagnosis status', type:'radio',
          options:['Formally diagnosed by VA provider','Formally diagnosed by military provider (Active Duty / MHS)','Formally diagnosed by private/civilian provider post-separation','Formally diagnosed by Guard/Reserve unit mental health provider','Suspected but not formally diagnosed yet','No formal diagnosis — evaluating if I should pursue one'],
          info:'Active duty diagnoses in your STRs (Service Treatment Records) or AHLTA record are strong evidence. Guard/Reserve unit providers\' notes also count as service records.' },
      ]
    });
    steps.push({
      id:'ptsd_symptoms', label:'PTSD — Symptoms', title:'PTSD: Symptoms & Functional Impact',
      conditionLabel:'PTSD / Mental Health',
      desc:'Answer based on how your conditions actually affect your life — not how you wish they did, and not tougher than the reality. VA compensation is determined by honest, accurate reporting of functional impact. Understating your symptoms is the single most common reason veterans receive less than they are entitled to.',
      fields:[
        { id:'ptsd_employment', label:'How has PTSD affected your work or career?', type:'radio',
          options:['Unable to work at all due to PTSD','Significant work impairment — missed work, performance issues, job loss','Moderate impairment — reduced effectiveness, some accommodations needed','Mild impairment — generally okay but symptoms affect performance under stress','No significant work impairment','Still on active duty — PTSD affects my duties/performance'] },
        { id:'ptsd_panic', label:'Frequency of panic attacks or overwhelming anxiety episodes', type:'radio',
          options:['Daily or near-daily','More than once a week','About once a week','Less than once a week','Rare / only under extreme stress','Have not experienced panic attacks'] },
        { id:'ptsd_sleep', label:'Sleep disruption', type:'radio',
          options:['Severely disrupted — rarely get more than 2-3 hours at a time','Poor — frequently interrupted, difficulty falling or staying asleep','Moderate — noticeably affected but functional','Mildly disrupted','Sleep is generally adequate'] },
        { id:'ptsd_nightmares', label:'Nightmares related to military service or the traumatic event', type:'radio',
          options:['Almost every night','Several nights per week','Weekly','Occasionally (monthly)','Rarely or never'] },
        { id:'ptsd_flashbacks', label:'Flashbacks — feeling like the event is happening again', type:'radio',
          options:['Frequent — interferes significantly with daily functioning','Occasional — several times a month','Rare — a few times a year','Have not experienced flashbacks'] },
        { id:'ptsd_avoidance', label:'Avoidance of people, places, or situations related to the trauma', type:'radio',
          options:['Severe — significantly limits where I go, who I see, what I do','Moderate — noticeable impact on my social life and activities','Mild — some avoidance but manageable','Minimal avoidance'] },
        { id:'ptsd_numbing', label:'Emotional numbing, detachment, or inability to feel positive emotions', type:'radio',
          options:['Most of the time — persistent numbness','Sometimes — comes and goes','Occasionally','Rarely or never'] },
        { id:'ptsd_irritability', label:'Irritability or anger outbursts', type:'radio',
          options:['Frequent and significant — affects relationships and daily life','Occasional — noticeable to others','Mild — mostly internal','Rarely or never'] },
        { id:'ptsd_relationships', label:'Impact on family, close relationships, or social functioning', type:'radio',
          options:['Severe — major relationship damage, isolation, inability to maintain relationships','Significant — family/friends notice major personality changes','Moderate — some strain on relationships','Mild — minimal relationship impact'] },
        { id:'ptsd_memory', label:'Memory and concentration problems', type:'radio',
          options:['Significant — affects daily functioning, miss appointments, forget conversations','Moderate — noticeable issues but compensating','Mild — occasional issues','Not significant'] },
        { id:'ptsd_startle', label:'Exaggerated startle response (loud noises, sudden movements)', type:'radio',
          options:['Yes — significantly disruptive to daily life','Yes — noticeable but manageable','Mildly','No'] },
        { id:'ptsd_suicidal', label:'Have you had thoughts of suicide or self-harm?', type:'radio', sensitive:true,
          options:['Yes — I have had these thoughts','No'],
          info:'This is a key clinical indicator for the 70%+ compensation threshold. Answering yes does not disqualify you — it ensures you receive the correct compensation level and appropriate support.' },
        { id:'ptsd_meds', label:'Current medications for PTSD, anxiety, or depression', type:'radio',
          options:['Yes — significantly effective','Yes — partial relief','Yes — minimal relief','No — not currently medicated','Active duty — prescribed through MTF/MHS'] },
      ]
    });
  }

  if (cond === 'back') {
    steps.push({
      id:'back_main', label:'Back & Spine', title:'Back & Spine: History & Symptoms',
      conditionLabel:'Back & Spine',
      desc:'Back conditions are rated based on range of motion, pain, and whether they cause nerve involvement (radiculopathy). Answer for your most affected spinal region.',
      fields:[
        { id:'back_region', label:'Which spinal region is affected?', type:'checkbox',
          options:['Lumbar (lower back)','Cervical (neck)','Thoracic (mid-back)','Multiple regions'] },
        { id:'back_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Formally diagnosed by VA provider','Formally diagnosed by military provider while on active duty','Formally diagnosed by MTF/military hospital','Formally diagnosed by Guard/Reserve unit medical officer or flight surgeon','Formally diagnosed by private/civilian provider','Self-reported — not yet formally diagnosed'] },
        { id:'back_cause', label:'What caused or contributed to your back condition?', type:'checkbox',
          options:['Heavy lifting, carrying heavy gear/rucksack','Parachute jumps / airborne operations','Vehicle accidents (military vehicle, IED blast)','Fall or impact during training or combat','Cumulative wear from physical duties','Specific injury during active duty/activation','Occupational hazard related to MOS/AFSC'] },
        { id:'back_motion', label:'Current limitation of motion (on your worst days)', type:'radio',
          options:['Cannot bend forward past 15-20 degrees (severe)','Limited to about 30 degrees of forward flexion','Limited to about 45-60 degrees','Moderate limitation — noticeable restriction','Mild limitation — slight stiffness'] },
        { id:'back_pain_freq', label:'Frequency of significant back pain', type:'radio',
          options:['Constant — present all day every day','Daily — present most of each day','Several times a week','Occasional — comes and goes','Mostly manageable with medication'] },
        { id:'back_radiculopathy', label:'Do you have radiating pain, numbness, or weakness in your arms or legs (radiculopathy)?', type:'radio',
          options:['Yes — both legs/arms affected (bilateral)','Yes — one leg or one arm affected','Intermittently — comes and goes','No radiation or numbness'] },
        { id:'back_work', label:'Impact on ability to work or perform duties', type:'radio',
          options:['Cannot perform any physical work','Limited to sedentary / light duty only','Moderate limitation — can work but with restrictions','Mild limitation — mostly okay but some restrictions','No significant work limitation','Active duty — on profile / limited duty'] },
        { id:'back_flareup', label:'Do you have flare-ups that are worse than your baseline?', type:'radio',
          options:['Yes — frequent severe flare-ups (weekly)','Yes — occasional flare-ups (monthly)','Yes — rare but very severe when they occur','No significant flare-ups beyond baseline'] },
      ]
    });
  }

  if (cond === 'knee') {
    steps.push({
      id:'knee_main', label:'Knee Conditions', title:'Knee: History & Symptoms',
      conditionLabel:'Knee Conditions',
      desc:'Knees are rated based on limitation of motion, instability, and whether both knees are affected. The VA rates each knee separately.',
      fields:[
        { id:'knee_which', label:'Which knee(s) are affected?', type:'radio',
          options:['Left knee only','Right knee only','Both knees'] },
        { id:'knee_diagnosis', label:'Diagnosis', type:'radio',
          options:['Diagnosed by VA provider','Diagnosed by military/MTF provider on active duty','Diagnosed by Guard/Reserve unit medical officer','Diagnosed by private provider post-separation','Multiple diagnoses from different providers','Not yet formally diagnosed'] },
        { id:'knee_condition', label:'Type of knee condition (select all that apply)', type:'checkbox',
          options:['Meniscus tear or damage','Ligament damage (ACL, PCL, MCL, LCL)','Chronic knee instability (gives out)','Limitation of flexion (can\'t fully bend)','Limitation of extension (can\'t fully straighten)','Chondromalacia (cartilage damage)','Post-surgical (knee surgery while in service or related)','Degenerative joint disease / arthritis'] },
        { id:'knee_flexion', label:'Limitation of flexion (bending the knee)', type:'radio',
          options:['Less than 30 degrees — severe limitation','About 30-60 degrees','About 60-90 degrees','About 90-100 degrees','Greater than 100 degrees — mild limitation'] },
        { id:'knee_instability', label:'Knee instability or giving out', type:'radio',
          options:['Severe — buckles with walking, cannot rely on it for weight bearing','Moderate — occasional buckle under moderate activity','Mild — only gives out under heavy exertion','No instability'] },
        { id:'knee_pain', label:'Pain frequency and severity', type:'radio',
          options:['Constant, severe pain affecting all activities','Daily pain, moderate to severe','Daily mild to moderate pain','Intermittent pain, several times a week','Occasional pain'] },
        { id:'knee_cause', label:'How was the knee injured or damaged?', type:'checkbox',
          options:['Physical training (running, ruck marching, PT)','Parachute/airborne landing','Combat or training accident','Vehicle accident / blast injury','Occupational overuse from military duties','No specific incident — gradual onset during service'] },
      ]
    });
  }

  if (cond === 'tinnitus') {
    steps.push({
      id:'tinnitus_main', label:'Tinnitus & Hearing', title:'Tinnitus & Hearing Loss',
      conditionLabel:'Tinnitus & Hearing',
      desc:'Tinnitus (DC 6260) is rated at 10% for recurrent tinnitus. Hearing loss is rated separately based on audiometric testing. Both are among the most commonly service-connected conditions.',
      fields:[
        { id:'tinnitus_present', label:'Do you experience tinnitus (ringing, buzzing, hissing in ears)?', type:'radio',
          options:['Yes — constant, never stops','Yes — recurrent, comes and goes','Yes — only in one ear','Mild — barely noticeable','No tinnitus'] },
        { id:'tinnitus_noise_exposure', label:'Were you exposed to loud noise during service?', type:'checkbox',
          options:['Weapons fire (rifle, artillery, mortar, machine gun)','Aircraft (crew, flight line, maintenance)','Tracked vehicle (tank, Bradley, AAV)','Explosions / IED blasts','Generator or heavy equipment noise','Shipboard noise (engine rooms, flight deck)','Other sustained occupational noise exposure'] },
        { id:'tinnitus_diagnosis', label:'Tinnitus / hearing condition diagnosis', type:'radio',
          options:['Diagnosed by VA audiologist','Diagnosed by military audiologist while on active duty','Documented in military DOEHRS hearing records','Diagnosed by Guard/Reserve hearing conservation program','Diagnosed by private audiologist','Not yet diagnosed — self-reporting symptoms'] },
        { id:'hearing_loss', label:'Do you have documented hearing loss?', type:'radio',
          options:['Yes — significant bilateral hearing loss (both ears)','Yes — significant unilateral hearing loss (one ear)','Yes — mild bilateral hearing loss','Mild — not formally tested','No documented hearing loss — only tinnitus'] },
        { id:'tinnitus_impact', label:'How does tinnitus affect your daily life?', type:'radio',
          options:['Severely — constant, affects sleep, concentration, and daily functioning','Moderately — noticeable, affects concentration and sleep','Mildly — present but not significantly disruptive','Minimally — rarely notice it'] },
        { id:'hearing_aids', label:'Do you use hearing aids?', type:'radio',
          options:['Yes — VA-provided','Yes — purchased privately','No — recommended but not using','No — not recommended'] },
      ]
    });
  }

  if (cond === 'sleep_apnea') {
    steps.push({
      id:'sa_main', label:'Sleep Apnea', title:'Sleep Apnea',
      conditionLabel:'Sleep Apnea',
      desc:'Sleep apnea (DC 6847) qualifies for VA compensation at 0%, 30%, 50%, or 100%. The 50% level requires CPAP or similar treatment. Many veterans have undiagnosed sleep apnea connected to PTSD, weight changes from service, or blast injuries.',
      fields:[
        { id:'sa_diagnosis', label:'Sleep apnea diagnosis status', type:'radio',
          options:['Formally diagnosed via sleep study — VA','Formally diagnosed via sleep study — military (active duty / MTF)','Formally diagnosed via sleep study — Guard/Reserve medical (during activation)','Formally diagnosed — private provider','Suspected but not yet tested','No diagnosis — evaluating symptoms'] },
        { id:'sa_type', label:'Type of sleep apnea (if diagnosed)', type:'radio',
          options:['Obstructive Sleep Apnea (OSA)','Central Sleep Apnea','Mixed/Complex','Unknown / not specified'] },
        { id:'sa_cpap', label:'CPAP or breathing device requirement', type:'radio',
          options:['Yes — prescribed and using CPAP/BiPAP/APAP','Yes — prescribed but not compliant (important for rating)','Yes — prescribed but not tolerated','No — not yet prescribed','No — prescribed surgery or other treatment'] },
        { id:'sa_symptoms', label:'Symptoms (select all that apply)', type:'checkbox',
          options:['Loud snoring','Waking up gasping or choking','Excessive daytime sleepiness (EDS)','Morning headaches','Difficulty concentrating due to poor sleep','Witnessed apnea episodes by partner/roommate','Fatigue affecting work or duty performance'] },
        { id:'sa_nexus', label:'What do you believe contributed to or caused your sleep apnea?', type:'checkbox',
          options:['PTSD / chronic hyperarousal from service','Weight gain during or after service related to military lifestyle','Blast injury / TBI affecting breathing regulation','Nasal/airway injury during service','Continuous operational stress / sleep deprivation during deployments','Not sure — first time evaluating this'] },
      ]
    });
  }

  if (cond === 'migraines') {
    steps.push({
      id:'migraine_main', label:'Migraines', title:'Migraines & Headaches',
      conditionLabel:'Migraines',
      desc:'Migraines (DC 8100) are rated based on "prostrating attacks" — attacks that force you to stop activity and lie down. Frequency determines the rating: 10%, 30%, or 50%.',
      fields:[
        { id:'mig_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA neurologist or provider','Diagnosed by military neurologist / flight surgeon (active duty)','Diagnosed by military MTF provider','Diagnosed by Guard/Reserve unit medical officer','Diagnosed by private neurologist or provider','Self-reported — not yet formally diagnosed'] },
        { id:'mig_type', label:'Type of headache condition', type:'radio',
          options:['Classic migraine with aura (visual disturbances, light sensitivity before onset)','Migraine without aura','Chronic daily headache','Tension-type headache','Mixed headache disorder','Not yet classified'] },
        { id:'mig_prostrating', label:'How often do you have "prostrating" attacks — headaches severe enough to stop all activity and lie down?', type:'radio',
          options:['More than once a week (very frequent)','About once a week','1-4 times per month','Less than once a month','I have chronic headaches but rarely fully prostrating attacks'] },
        { id:'mig_duration', label:'Average duration of a severe headache attack', type:'radio',
          options:['1-4 hours','4-12 hours','12-24 hours','More than 24 hours','Variable'] },
        { id:'mig_triggers', label:'Known triggers (select all that apply)', type:'checkbox',
          options:['Noise / loud sounds (hyperacusis)','Light sensitivity (photophobia)','Stress / anxiety','Blast exposure or TBI','Disrupted sleep','Odors / chemical exposures','Weather changes','Caffeine / dehydration','No identified triggers'] },
        { id:'mig_work', label:'Impact on work or duty performance', type:'radio',
          options:['Cannot work during attacks — requires complete rest','Significantly limits productivity during and after attacks','Moderate limitation','Mild — can push through with medication','Minimal work impact'] },
        { id:'mig_cause', label:'What do you believe contributed to your migraines during service?', type:'radio',
          options:['Blast injury / TBI / concussion during service','Occupational noise exposure','Operational stress from deployments','Neck / cervical spine injury during service','Developed during service — cause unclear','Pre-existing condition that worsened during service'] },
      ]
    });
  }

  if (cond === 'tbi') {
    steps.push({
      id:'tbi_main', label:'TBI', title:'Traumatic Brain Injury (TBI)',
      conditionLabel:'TBI',
      desc:'TBI (DC 8045) is rated based on residual effects in 10 cognitive and physical domains. The severity of residuals — not the initial injury — determines the rating.',
      fields:[
        { id:'tbi_event', label:'Type of TBI-causing event', type:'checkbox',
          options:['IED blast / explosion','Vehicle rollover or crash','Direct blow to the head (fall, struck by object)','Blast pressure wave (near miss, inside building during explosion)','Multiple concussions (cumulative)','Training accident'] },
        { id:'tbi_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA TBI specialist','Diagnosed by military neurologist / TBI clinic (active duty)','Documented in military records (MACE screening, concussion protocol)','Diagnosed by Guard/Reserve medical during federal activation','Diagnosed by private neurologist','Experienced concussion(s) but not formally evaluated','No formal TBI diagnosis'] },
        { id:'tbi_severity', label:'Initial severity (at time of injury)', type:'radio',
          options:['Mild TBI / concussion (brief or no loss of consciousness, confusion)','Moderate TBI (loss of consciousness up to 24 hours, post-traumatic amnesia)','Severe TBI (loss of consciousness >24 hours, significant neurological deficits)','Unknown / not assessed at time of injury'] },
        { id:'tbi_cognitive', label:'Current cognitive residuals (select all that apply)', type:'checkbox',
          options:['Memory problems — short or long term','Concentration and attention difficulties','Word-finding problems (aphasia)','Slowed thinking / processing speed','Executive function problems (planning, decision-making)','Behavioral changes — irritability, impulsivity','Emotional dysregulation'] },
        { id:'tbi_physical', label:'Current physical residuals (select all that apply)', type:'checkbox',
          options:['Chronic headaches / migraines','Dizziness or balance problems','Vision problems / light sensitivity','Hearing problems / tinnitus','Sleep disturbance','Fatigue','Seizures'] },
        { id:'tbi_work', label:'Impact of TBI residuals on work or daily functioning', type:'radio',
          options:['Total — cannot maintain employment or independent living','Severe — significant limitations in most areas','Moderate — noticeable impairment but partially functional','Mild — some difficulty with complex tasks','Minimal — mostly compensated'] },
      ]
    });
  }

  if (cond === 'hypertension') {
    steps.push({
      id:'htn_main', label:'Hypertension', title:'Hypertension (High Blood Pressure)',
      conditionLabel:'Hypertension',
      desc:'Hypertension (DC 7101) is rated based on diastolic and systolic blood pressure levels, requiring medication, and cardiac enlargement on imaging.',
      fields:[
        { id:'htn_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA provider','Diagnosed by military provider on active duty (recorded in STRs/AHLTA)','Diagnosed by Guard/Reserve flight surgeon or unit medical officer during activation','Diagnosed by private provider post-separation','Recently diagnosed — not yet rated'] },
        { id:'htn_bp', label:'Most recent blood pressure readings (approximate)', type:'radio',
          options:['Diastolic predominantly 130 or higher (severe)','Diastolic predominantly 120-129','Diastolic predominantly 110-119','Diastolic predominantly 100-109','Diastolic predominantly 90-99','Controlled with medication — difficult to assess without meds'] },
        { id:'htn_meds', label:'Hypertension medication status', type:'radio',
          options:['Yes — required for control (single medication)','Yes — required for control (multiple medications)','Yes — prescribed but condition poorly controlled','No medication — lifestyle management only','No medication — recently diagnosed, not yet started'] },
        { id:'htn_nexus', label:'What do you believe contributed to your hypertension?', type:'checkbox',
          options:['Chronic PTSD / stress from service','Combat exposure / chronic stress response','Obesity related to service lifestyle and changes','Burn pit / toxic exposure (PACT Act)','Agent Orange exposure','Gulf War / Southwest Asia service (Gulf War illness)','Developed during service — no other identified cause'] },
        { id:'htn_cardiac', label:'Have you had any cardiac testing showing related complications?', type:'radio',
          options:['Yes — echocardiogram showing cardiac enlargement','Yes — other cardiac findings','No significant findings on testing','No cardiac testing done'] },
      ]
    });
  }

  if (cond === 'shoulder') {
    steps.push({
      id:'shoulder_main', label:'Shoulder Conditions', title:'Shoulder: History & Symptoms',
      conditionLabel:'Shoulder Conditions',
      desc:'Shoulders are rated based on limitation of motion — specifically how high you can raise your arm from your side (abduction) or from your body (forward flexion). Dominant arm gets a 10% higher rating.',
      fields:[
        { id:'shoulder_which', label:'Which shoulder(s)?', type:'radio',
          options:['Right shoulder (dominant arm)','Right shoulder (non-dominant)','Left shoulder (dominant arm)','Left shoulder (non-dominant)','Both shoulders'] },
        { id:'shoulder_diagnosis', label:'Diagnosis', type:'radio',
          options:['Diagnosed by VA orthopedic provider','Diagnosed by military orthopedic surgeon or provider (active duty)','Diagnosed by MTF or military hospital','Diagnosed by Guard/Reserve unit medical (during activation)','Diagnosed by private orthopedic provider','Not yet formally diagnosed'] },
        { id:'shoulder_condition', label:'Type of shoulder condition (select all that apply)', type:'checkbox',
          options:['Rotator cuff tear (partial or full)','Rotator cuff impingement / tendinitis','Labral tear (SLAP, Bankart)','Shoulder instability / chronic dislocation','AC joint separation or injury','Biceps tendon injury','Post-surgical shoulder','Degenerative joint disease / arthritis'] },
        { id:'shoulder_abduction', label:'How high can you raise your arm out to the side (abduction)?', type:'radio',
          options:['Less than 25 degrees — severely limited','About 25-60 degrees','About 60-90 degrees','About 90-120 degrees','Greater than 120 degrees — mild limitation'] },
        { id:'shoulder_cause', label:'How did the shoulder condition develop?', type:'checkbox',
          options:['Heavy lifting / carrying military equipment','Airborne / parachute operations','Combatives / hand-to-hand training','Fall or impact during duty','Overhead work from MOS/AFSC duties','Repetitive motion / occupational overuse','Specific injury during service'] },
      ]
    });
  }

  if (cond === 'skin') {
    steps.push({
      id:'skin_main', label:'Skin Conditions', title:'Skin Conditions & Scars',
      conditionLabel:'Skin Conditions',
      desc:'Skin conditions are rated by the area of body surface affected and the treatment required. Burn pit exposure (PACT Act 2022) is now a presumptive condition for many veterans.',
      fields:[
        { id:'skin_type', label:'Type of skin condition (select all that apply)', type:'checkbox',
          options:['Eczema / atopic dermatitis','Contact dermatitis','Psoriasis','Acne (severe cystic acne from service)','Scars (surgical, traumatic, burn)','Skin cancer / squamous cell / melanoma','Burn injury','Rash or skin condition related to toxic exposure'] },
        { id:'skin_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA dermatologist','Diagnosed by military dermatologist / provider (active duty)','Documented in STRs during service','Diagnosed by Guard/Reserve medical during activation','Diagnosed by private dermatologist','Self-reported — evaluating if service-connected'] },
        { id:'skin_pact', label:'PACT Act / Toxic Exposure (if applicable)', type:'radio',
          options:['Yes — deployed to burn pit locations (Southwest Asia, 2001-present)','Yes — Agent Orange exposure (Vietnam, Korea, Thailand bases)','Yes — other toxic chemical exposure during service','Not applicable — condition not related to toxic exposure','Unsure — want to evaluate'] },
        { id:'skin_body_area', label:'Approximate body surface area affected by your skin condition', type:'radio',
          options:['Less than 5% (small patches)','5-20% (moderate area)','20-40% (large area, multiple body regions)','More than 40% (most of body surface)','Localized scar or single lesion'] },
        { id:'skin_treatment', label:'Treatment required', type:'radio',
          options:['Systemic therapy (oral medications, biologics, immunosuppressants)','Topical steroids plus other medications — ongoing','Topical treatment — intermittent','Moisturizers / minor topical treatment only','No active treatment currently needed'] },
      ]
    });
  }

  if (cond === 'respiratory') {
    steps.push({
      id:'resp_main', label:'Respiratory', title:'Respiratory Conditions',
      conditionLabel:'Respiratory',
      desc:'Respiratory conditions include asthma, rhinitis, sinusitis, and PACT Act presumptive conditions from burn pit and toxic exposures. Ratings are based on FEV-1 testing and treatment requirements.',
      fields:[
        { id:'resp_type', label:'Type of respiratory condition (select all that apply)', type:'checkbox',
          options:['Asthma / reactive airway disease','Allergic rhinitis (chronic nasal/sinus inflammation)','Chronic sinusitis','Rhinosinusitis','Constrictive bronchiolitis (burn pit-related)','COPD','Interstitial lung disease','Upper respiratory — burn pit / toxic exposure related'] },
        { id:'resp_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA pulmonologist or provider','Diagnosed by military pulmonologist / provider (active duty)','Diagnosed by MTF — documented in STRs','Diagnosed by Guard/Reserve medical during activation','Diagnosed by private provider post-separation','Suspected — experiencing symptoms, not yet tested'] },
        { id:'resp_pact', label:'PACT Act burn pit exposure', type:'radio',
          options:['Yes — deployed to Southwest Asia after 9/11 (Iraq, Afghanistan, Kuwait, etc.)','Yes — other qualifying deployment (Gulf War, Djibouti, etc.)','Not applicable — respiratory condition unrelated to toxic exposure','Unsure — want to evaluate eligibility'] },
        { id:'resp_severity', label:'Current severity', type:'radio',
          options:['Severely limiting — cannot perform strenuous activity, frequent hospitalizations','Moderately severe — requires daily medication, limits exertion','Moderate — managed with regular medication, some limitations','Mild — intermittent symptoms, controlled with PRN medication','Well-controlled — occasional breakthrough symptoms'] },
        { id:'resp_work', label:'Impact on duty or employment', type:'radio',
          options:['Cannot perform physical duties at all','Significantly limits physical duties / activities','Moderate limitation on strenuous activity','Minimal work limitation','Active duty — on medical profile for respiratory condition'] },
      ]
    });
  }

  if (cond === 'feet') {
    steps.push({
      id:'feet_main', label:'Feet & Ankles', title:'Feet & Ankles',
      conditionLabel:'Feet & Ankles',
      desc:'Foot conditions like plantar fasciitis and pes planus are extremely common in veterans from the physical demands of service. Rated based on the degree of functional impairment.',
      fields:[
        { id:'feet_type', label:'Type of foot/ankle condition (select all that apply)', type:'checkbox',
          options:['Plantar fasciitis (heel/arch pain)','Pes planus (flat feet)','Ankle instability / chronic sprains','Achilles tendon injury or tendinitis','Hallux valgus (bunion)','Stress fracture history','Morton\'s neuroma','Post-surgical foot or ankle'] },
        { id:'feet_diagnosis', label:'Diagnosis status', type:'radio',
          options:['Diagnosed by VA podiatrist or orthopedic','Diagnosed by military provider (active duty)','Documented in STRs during service','Diagnosed by Guard/Reserve medical during activation','Diagnosed by private provider','Not yet formally diagnosed'] },
        { id:'feet_severity', label:'Severity of foot/ankle condition', type:'radio',
          options:['Severe — unable to walk more than short distances, requires assistive device','Moderate-severe — significantly limits standing, walking, and physical activity','Moderate — noticeable limitation, requires orthotics or bracing','Mild — some pain and limitation but functional','Minimal — controlled with orthotics/insoles'] },
        { id:'feet_both', label:'Are both feet or ankles affected?', type:'radio',
          options:['Yes — bilateral (both sides)','Right side only','Left side only'] },
        { id:'feet_cause', label:'Contributing factors during service', type:'checkbox',
          options:['Excessive running / physical training (PT requirements)','Ruck marching / carrying heavy loads','Standing on hard surfaces for extended periods','Ill-fitting military footwear','Specific injury during duty','Occupational demands of MOS/AFSC'] },
      ]
    });
  }

  if (cond === 'hip') {
    steps.push({ id:'hip_main', label:'Hip Conditions', title:'Hip Conditions: History & Symptoms', conditionLabel:'Hip Conditions',
      desc:'Hip conditions are rated under DC 5252 based on limitation of flexion and extension. Each hip is rated separately. Secondary hip degeneration from a back condition or altered gait should be claimed separately.',
      fields:[
        { id:'hip_which', label:'Which hip is affected?', type:'radio', options:['Left hip only','Right hip only','Both hips'] },
        { id:'hip_condition', label:'Type of hip condition (select all that apply)', type:'checkbox', options:['Hip arthritis / degenerative joint disease','Labral tear','Hip impingement (FAI)','Hip bursitis','Avascular necrosis (bone death from injury or steroids)','Post-surgical (hip replacement or repair)','Chronic hip pain — not otherwise specified'] },
        { id:'hip_flexion', label:'Limitation of hip flexion (raising the leg/thigh forward)', type:'radio', options:['Less than 20 degrees — severe limitation (40% level)','About 20-40 degrees','About 40-70 degrees','About 70-90 degrees','Greater than 90 degrees — mild limitation'] },
        { id:'hip_cause', label:'What caused or contributed to the hip condition?', type:'checkbox', options:['Ruck marching / carrying heavy loads','Running and physical training requirements','Parachute/airborne operations','Vehicle accident / blast injury','Specific in-service injury','Cumulative wear from military duties','Secondary to back condition (altered gait)'] },
        { id:'hip_work', label:'Impact on ability to work or perform duties', type:'radio', options:['Cannot walk or stand for any period','Limited to sedentary work only','Moderate limitation — cannot stand/walk more than 2 hours','Mild limitation — some restriction','No significant work limitation'] },
      ]
    });
  }

  if (cond === 'elbow_wrist_hand') {
    steps.push({ id:'ewh_main', label:'Elbow, Wrist & Hand', title:'Elbow, Wrist & Hand: History & Symptoms', conditionLabel:'Elbow, Wrist & Hand',
      desc:'Upper extremity conditions are rated based on limitation of motion, grip strength, and nerve involvement. Dominant arm receives higher compensation. Each joint is rated separately.',
      fields:[
        { id:'ewh_which', label:'Which area(s) are affected?', type:'checkbox', options:['Elbow — dominant arm','Elbow — non-dominant arm','Wrist — dominant arm','Wrist — non-dominant arm','Hand or fingers — dominant','Hand or fingers — non-dominant'] },
        { id:'ewh_condition', label:'Type of condition (select all that apply)', type:'checkbox', options:['Carpal tunnel syndrome','Tennis or golfer\'s elbow (epicondylitis)','Trigger finger','Nerve damage (ulnar, radial, or median nerve)','Fracture with residuals','Tendon damage or rupture','Arthritis / degenerative joint disease','Crush injury','Amputation or partial amputation'] },
        { id:'ewh_grip', label:'Grip strength and hand function', type:'radio', options:['Cannot grip at all — complete functional loss','Severely limited — grip only possible with great effort','Moderate limitation — grip is painful and restricted','Mild limitation — grip is weaker but functional','Normal grip strength'] },
        { id:'ewh_motion', label:'Range of motion limitation', type:'radio', options:['Severely limited — less than half normal motion','Moderately limited — about half normal motion','Mildly limited — some restriction','Minimal limitation'] },
        { id:'ewh_cause', label:'How was the condition caused?', type:'checkbox', options:['Repetitive military duties (weapon handling, wrench-turning, lifting)','Specific trauma or injury during service','Blast or explosion','Vehicle accident','Fall during training or duty','Occupational overuse from MOS/AFSC'] },
      ]
    });
  }

  if (cond === 'neck') {
    steps.push({ id:'neck_main', label:'Neck (Cervical Spine)', title:'Cervical Spine (Neck): History & Symptoms', conditionLabel:'Neck (Cervical Spine)',
      desc:'Cervical spine conditions are rated under DC 5237 based on range of motion. Radiculopathy into the arms is rated separately and can significantly increase total compensation.',
      fields:[
        { id:'neck_condition', label:'Type of cervical condition (select all that apply)', type:'checkbox', options:['Cervical strain / muscle injury','Cervical disc disease (herniated or bulging disc)','Degenerative disc disease','Cervical spondylosis (arthritis)','Spinal stenosis — cervical','Whiplash residuals','Post-surgical cervical'] },
        { id:'neck_diagnosis', label:'Diagnosis status', type:'radio', options:['Diagnosed by VA provider','Diagnosed by military/MTF provider on active duty','Diagnosed by Guard/Reserve unit medical officer','Diagnosed by private provider','Not yet formally diagnosed'] },
        { id:'neck_flexion', label:'Forward flexion of the neck (chin toward chest)', type:'radio', options:['Cannot bend forward past 10-15 degrees — severe (30% level)','Limited to about 15-30 degrees (20% level)','Limited to about 30-45 degrees (10% level)','Limited but greater than 45 degrees — mild','Near normal range of motion'] },
        { id:'neck_radiculopathy', label:'Do you have radiating pain, numbness, or weakness into your arms, hands, or fingers?', type:'radio', options:['Yes — both arms/hands affected (bilateral)','Yes — one arm or hand affected','Intermittently — comes and goes','No arm/hand radiation'] },
        { id:'neck_cause', label:'What caused or contributed to the neck condition?', type:'checkbox', options:['Wearing heavy helmet or NVG mount over extended periods','Airborne operations / parachute jumps','Vehicle accident or blast (whiplash)','Heavy ruck/load carriage','Specific injury during service','Cumulative occupational wear'] },
        { id:'neck_work', label:'Impact on work or duties', type:'radio', options:['Cannot perform any work requiring neck movement','Significant limitation — desk/sedentary work only','Moderate limitation — some restrictions on duties','Mild limitation — mostly functional','No significant impact'] },
      ]
    });
  }

  if (cond === 'mental_health') {
    steps.push({ id:'mh_main', label:'Depression & Anxiety', title:'Depression & Anxiety: Symptoms & Functional Impact', conditionLabel:'Depression & Anxiety',
      desc:'Depression and anxiety are rated under the General Rating Formula for Mental Disorders (38 CFR § 4.130) — the same criteria as PTSD. What determines compensation is functional impact, not the specific diagnostic label.',
      fields:[
        { id:'mh_diagnosis', label:'Diagnosis (select the closest match)', type:'radio', options:['Major Depressive Disorder (MDD)','Generalized Anxiety Disorder (GAD)','Adjustment disorder with depression or anxiety','Bipolar disorder','OCD (Obsessive-Compulsive Disorder)','Diagnosed — exact label not yet confirmed','Suspected but not yet formally diagnosed'] },
        { id:'mh_employment', label:'Impact on work or career', type:'radio', options:['Unable to work at all','Significant impairment — missed work, job loss, performance issues','Moderate impairment — some accommodations needed','Mild — generally manageable','No significant work impact','Active duty — affects my duties/performance'] },
        { id:'mh_daily', label:'Impact on daily activities — self-care, household, appointments', type:'radio', options:['Severe — unable to manage basic daily functions','Significant — requires help with many tasks','Moderate — some difficulty but managing','Mild — mostly independent','Minimal impact'] },
        { id:'mh_social', label:'Impact on relationships and social functioning', type:'radio', options:['Severe — isolated, no meaningful relationships maintained','Significant — major strain on family and friendships','Moderate — noticeable impact','Mild — some social withdrawal','Minimal social impact'] },
        { id:'mh_frequency', label:'Frequency of significant episodes', type:'radio', options:['Constant — persistent most of the time','Daily — present most days','Several times a week','Weekly','Occasional — comes and goes'] },
        { id:'mh_suicidal', label:'Have you had thoughts of suicide or self-harm?', type:'radio', sensitive:true, options:['Yes — I have had these thoughts','No'], info:'This is a key clinical indicator for the 70%+ compensation threshold. Answering yes does not disqualify you — it ensures accurate compensation and appropriate support.' },
        { id:'mh_meds', label:'Current medications', type:'radio', options:['Yes — significantly effective','Yes — partial relief','Yes — minimal relief','No — not currently medicated','Active duty — prescribed through MTF/MHS'] },
        { id:'mh_nexus', label:'How is the condition connected to service?', type:'radio', options:['Direct service stressor (combat, trauma, loss)','Military Sexual Trauma (MST)','Operational stress and tempo','Secondary to TBI','Secondary to chronic pain or physical condition','Other in-service event','Not yet established — evaluating nexus'] },
      ]
    });
  }

  if (cond === 'mst') {
    steps.push({ id:'mst_main', label:'Military Sexual Trauma', title:'Military Sexual Trauma (MST)', conditionLabel:'Military Sexual Trauma',
      desc:'MST is the in-service event — not the diagnosis. Conditions resulting from MST (PTSD, depression, physical conditions) receive the VA compensation. VA has relaxed evidentiary standards for MST claims: you do not need a police report or formal incident report on file.',
      fields:[
        { id:'mst_occurred', label:'Did MST occur during your military service?', type:'radio', options:['Yes','Prefer not to specify — evaluating options'] },
        { id:'mst_reported', label:'Was the incident reported?', type:'radio', options:['Yes — formally reported through military channels','Restricted report only','No — not reported at the time','Reported post-separation to VA or civilian authorities','Prefer not to disclose reporting status'], info:'VA does not require a formal report or conviction. Alternative evidence — buddy statements, requests for transfer, behavioral changes documented in records, medical records noting distress — can establish MST.' },
        { id:'mst_conditions', label:'What conditions have resulted from MST? (select all that apply)', type:'checkbox', options:['PTSD / trauma symptoms','Major depression','Anxiety disorder','Chronic sleep disturbance','Chronic pain','Substance use disorder','Reproductive or sexual health conditions','Difficulty with personal relationships','Other physical or mental health conditions'] },
        { id:'mst_treatment', label:'Have you received mental health treatment related to MST?', type:'radio', options:['Yes — VA MST treatment program','Yes — civilian/private provider','Yes — military mental health provider','No — not yet sought treatment','No — treatment was not accessible or helpful'] },
        { id:'mst_evidence', label:'What alternative evidence exists? (select all that apply)', type:'checkbox', options:['Medical records showing behavioral change after the event','Requests for transfer or reassignment','Drop in performance evaluations','Buddy statements from fellow service members','Statements from family, friends, or clergy','Law enforcement or counseling records','Personal journals or contemporaneous records','VA or civilian mental health records'], info:'Your own credible statement, combined with any of the above, can establish MST nexus under VA\'s relaxed evidentiary standard.' },
      ]
    });
  }

  if (cond === 'diabetes') {
    steps.push({ id:'dm_main', label:'Diabetes Mellitus', title:'Diabetes Mellitus: History & Complications', conditionLabel:'Diabetes Mellitus',
      desc:'Diabetes Mellitus Type II is rated under DC 7913 based on treatment required and blood sugar regulation. Agent Orange, Camp Lejeune, and certain PACT Act exposures create presumptive service connection. Complications — neuropathy, retinopathy, kidney disease — are rated separately.',
      fields:[
        { id:'dm_type', label:'Type of diabetes', type:'radio', options:['Type 1 — insulin-dependent','Type 2 — non-insulin-dependent','Type 2 — now requiring insulin','Not yet confirmed — elevated blood sugar documented in service records'] },
        { id:'dm_treatment', label:'Current treatment', type:'radio', options:['Insulin pump','Insulin — two or more injections per day','Insulin — one injection per day','Oral medications only','Diet and exercise only','Multiple medications — not yet insulin'] },
        { id:'dm_regulation', label:'How well is your diabetes regulated?', type:'radio', options:['Poorly — frequent hospitalizations or hypoglycemic episodes requiring assistance','Difficult — requires frequent medication adjustments','Moderate — some episodes but generally stable','Well — stable with current treatment'] },
        { id:'dm_complications', label:'Complications (select all that apply)', type:'checkbox', options:['Peripheral neuropathy — numbness/tingling in feet or hands','Diabetic retinopathy — eye damage','Diabetic nephropathy — kidney damage','Erectile dysfunction or sexual dysfunction','Cardiovascular disease','Peripheral vascular disease','Diabetic foot ulcers or amputations','Stroke or TIA'] },
        { id:'dm_exposure', label:'Qualifying toxic exposure linked to diabetes', type:'radio', options:['Vietnam veteran — Agent Orange exposure (presumptive for Type 2)','Southwest Asia service — potential PACT Act exposure','Camp Lejeune water contamination (1953-1987)','Other documented toxic exposure','No known toxic exposure'] },
      ]
    });
  }

  if (cond === 'heart') {
    steps.push({ id:'heart_main', label:'Heart Disease / CAD', title:'Heart Disease & Cardiovascular Conditions', conditionLabel:'Heart Disease / CAD',
      desc:'Ischemic heart disease (coronary artery disease) is rated under DC 7005 based on workload tolerance (METs) and ejection fraction. It is presumptive for Agent Orange-exposed veterans. Heart conditions secondary to hypertension or diabetes also qualify.',
      fields:[
        { id:'heart_condition', label:'Cardiovascular condition(s) — select all that apply', type:'checkbox', options:['Coronary artery disease (CAD) / ischemic heart disease','Heart attack (MI) — history of','Congestive heart failure (CHF)','Cardiomyopathy','Arrhythmia (atrial fibrillation, etc.)','Valvular disease (mitral or aortic)','Peripheral artery disease (PAD)','Hypertensive heart disease'] },
        { id:'heart_mets', label:'Exercise tolerance — what can you do without chest pain or shortness of breath?', type:'radio', options:['Less than 3 METs — cannot climb stairs or walk slowly without symptoms (100% level)','3-5 METs — light housework OK; symptoms with moderate effort (60% level)','5-7 METs — walk briskly OK; symptoms only with strenuous effort (30% level)','Greater than 7 METs — mostly functional; symptoms with heavy exertion only (10% level)','Not formally tested — describing symptoms generally'] },
        { id:'heart_ef', label:'Ejection fraction (from echocardiogram, if known)', type:'radio', options:['Less than 30% — severely reduced (100% level)','30-50% — moderately reduced','Greater than 50% — preserved or mildly reduced','Not tested or unknown'] },
        { id:'heart_nexus', label:'How is the heart condition connected to service?', type:'radio', options:['Agent Orange / Vietnam exposure (presumptive for ischemic heart disease)','Secondary to service-connected hypertension','Secondary to service-connected diabetes','In-service cardiac event documented','PACT Act toxic exposure','Operational stress from high-stress MOS','Not yet established — evaluating'] },
        { id:'heart_work', label:'Impact on ability to work', type:'radio', options:['Cannot work at all','Sedentary work only — no physical exertion tolerated','Moderate limitation on physical activity','Mild limitation','No significant work impact'] },
      ]
    });
  }

  if (cond === 'gerd_gi') {
    steps.push({ id:'gi_main', label:'GERD & GI Conditions', title:'Gastrointestinal Conditions: GERD, IBS, Crohn\'s & More', conditionLabel:'GERD & GI Conditions',
      desc:'GI conditions are commonly claimed secondary to PTSD, service medications, or direct service events. Ratings are based on symptom frequency, weight loss, and treatment required.',
      fields:[
        { id:'gi_condition', label:'GI condition(s) — select all that apply', type:'checkbox', options:['GERD / acid reflux / heartburn (DC 7346)','Hiatal hernia','Peptic or gastric ulcer (DC 7304)','IBS — Irritable Bowel Syndrome (DC 7319)','Crohn\'s disease / Inflammatory Bowel Disease (DC 7323)','Ulcerative colitis','Hemorrhoids (DC 7336)','Liver condition / hepatitis C (DC 7354)','Chronic diarrhea or constipation','Gastroparesis'] },
        { id:'gi_frequency', label:'Frequency of significant GI symptoms', type:'radio', options:['Daily — constant, affecting every meal','Daily — present most of the day','Several times a week','Weekly','Occasional'] },
        { id:'gi_severity', label:'Severity of symptoms', type:'radio', options:['Severe — hospitalizations or ER visits','Moderate to severe — requires continuous prescription medication','Moderate — managed with daily medication','Mild — manageable with OTC or dietary changes'] },
        { id:'gi_weight', label:'Have you had significant unintentional weight loss?', type:'radio', options:['Yes — significant weight loss (10+ lbs unintentional)','Some weight loss but less than 10 lbs','No significant weight loss'] },
        { id:'gi_nexus', label:'How is the GI condition connected to service?', type:'radio', options:['Secondary to PTSD (stress-gut connection)','Secondary to service-connected medications (NSAIDs, steroids)','Gulf War Illness / medically unexplained GI symptoms','In-service deployment — contaminated food or water','Direct in-service diagnosis','PACT Act toxic exposure','Not yet established — evaluating'] },
        { id:'gi_work', label:'Impact on ability to work', type:'radio', options:['Cannot maintain employment','Significant impact — frequent absences or bathroom access required','Moderate impact — some work restrictions','Mild impact','No significant work impact'] },
      ]
    });
  }

  if (cond === 'gulfwar') {
    steps.push({ id:'gw_main', label:'Gulf War Illness', title:'Gulf War Illness & Medically Unexplained Symptoms', conditionLabel:'Gulf War Illness',
      desc:'Gulf War Illness covers chronic multisymptom illness (MUCMI) in veterans who served in Southwest Asia since August 1990. VA does not require proof of a specific cause — qualifying service and qualifying chronic symptoms are sufficient for presumptive service connection under 38 CFR § 3.317.',
      fields:[
        { id:'gw_service', label:'Did you serve in Southwest Asia?', type:'radio', options:['Yes — Gulf War (1990-1991)','Yes — Operation Iraqi Freedom or Enduring Freedom','Yes — other Southwest Asia deployment since August 1990','Yes — Djibouti, Somalia, or other qualifying locations','Not sure — need to review service records'] },
        { id:'gw_symptoms', label:'Symptoms experienced (select all that apply)', type:'checkbox', options:['Chronic fatigue — persistent, not explained by other diagnosis','Widespread muscle pain or fibromyalgia','Cognitive difficulties — memory, concentration, word-finding','Headaches — frequent, not otherwise explained','Functional GI disorders — IBS, diarrhea, constipation','Skin rashes or unexplained skin conditions','Respiratory symptoms — rhinitis, sinusitis, shortness of breath','Sleep disturbance — insomnia, non-restorative sleep','Mood disorders — anxiety or depression','Joint pain without obvious cause','Dizziness or vertigo'] },
        { id:'gw_duration', label:'Duration of symptoms', type:'radio', options:['Chronic — present for 6 months or more (required for Gulf War presumptive)','Present for 3-6 months','Less than 3 months — may not yet qualify as chronic','Episodic — comes and goes across years'] },
        { id:'gw_exclusions', label:'Have other diagnoses been evaluated?', type:'radio', options:['Yes — evaluated but no clear diagnosis explains all symptoms','Partially — some symptoms explained, others not','Diagnosed with fibromyalgia or chronic fatigue syndrome (these qualify)','No — have not been formally evaluated yet'] },
        { id:'gw_exposure', label:'Known exposures during service (select all that apply)', type:'checkbox', options:['Burn pits','Oil well fire smoke','Chemical agent exposure or suspected exposure','Depleted uranium','Pesticide exposure (DEET, permethrin, organophosphates)','Contaminated water or food','Pyridostigmine bromide (PB) pills','Infectious disease — leishmaniasis, etc.'] },
      ]
    });
  }

  if (cond === 'cancer') {
    steps.push({ id:'cancer_main', label:'Cancer / Toxic Exposure', title:'Cancer & Toxic Exposure Conditions', conditionLabel:'Cancer / Toxic Exposure',
      desc:'Many cancers qualify for presumptive service connection under the PACT Act (2022), Agent Orange presumptives, ionizing radiation, or Camp Lejeune contamination. VA compensation for active cancer is typically 100% during treatment, with residuals rated after treatment ends.',
      fields:[
        { id:'cancer_type', label:'Type of cancer (select all that apply)', type:'checkbox', options:['Lung cancer','Head or neck cancer','Bladder cancer','Colorectal or GI cancer','Prostate cancer','Leukemia, lymphoma, or multiple myeloma','Melanoma or other skin cancer','Kidney cancer','Thyroid cancer','Breast cancer','Brain or CNS cancer','Other malignancy'] },
        { id:'cancer_status', label:'Current cancer status', type:'radio', options:['Active — currently in treatment','In remission — treatment complete, monitoring','Residuals only — cancer resolved but permanent damage remains','Recurrent — returned after remission'] },
        { id:'cancer_exposure', label:'Qualifying toxic exposure (select all that apply)', type:'checkbox', options:['PACT Act — burn pit or airborne hazard exposure (post-9/11)','Agent Orange — Vietnam service or other qualifying locations','Ionizing radiation — nuclear testing or Hiroshima/Nagasaki occupation','Camp Lejeune water contamination (1953-1987)','Mustard gas or Lewisite exposure','Depleted uranium exposure'] },
        { id:'cancer_residuals', label:'Residual effects after treatment (select all that apply)', type:'checkbox', options:['Peripheral neuropathy from chemotherapy','Radiation damage to surrounding tissue','Organ removal or partial removal','Chronic fatigue post-treatment','Cognitive effects (chemo brain)','Scarring or disfigurement','Reproductive effects','Lymphedema','Secondary conditions from treatment'] },
        { id:'cancer_work', label:'Impact on ability to work', type:'radio', options:['Cannot work — currently in active treatment','Significant limitations from treatment side effects or residuals','Moderate limitations','Mild limitations — mostly recovered','No current work limitation'] },
      ]
    });
  }

  if (cond === 'genitourinary') {
    steps.push({ id:'gu_main', label:'Kidney & Bladder', title:'Genitourinary: Kidney, Bladder & Reproductive Conditions', conditionLabel:'Kidney & Bladder',
      desc:'Genitourinary conditions include kidney disease, bladder dysfunction, urinary incontinence, and reproductive conditions. Erectile dysfunction may qualify for Special Monthly Compensation (SMC-K) — a flat additional payment on top of your combined rating.',
      fields:[
        { id:'gu_condition', label:'Condition(s) — select all that apply', type:'checkbox', options:['Chronic kidney disease (CKD)','Kidney stones — recurrent','Bladder dysfunction or neurogenic bladder','Urinary incontinence','Recurrent urinary tract infections','Erectile dysfunction (ED)','Sexual dysfunction (non-ED)','Chronic prostatitis','Testicular conditions','Female reproductive conditions (endometriosis, etc.)','Interstitial cystitis'] },
        { id:'gu_severity', label:'Severity of kidney or bladder symptoms', type:'radio', options:['Severe — requires dialysis or major medical management','Constant involuntary voiding / incontinence','Requires wearing absorbent materials daily','Moderate — frequent symptoms requiring ongoing treatment','Mild — periodic symptoms'] },
        { id:'gu_ed', label:'If claiming erectile dysfunction — severity', type:'radio', options:['Complete erectile dysfunction','Partial — unable to maintain adequate erection','Mild — some difficulty but functional with treatment','Not applicable'], info:'Complete organic erectile dysfunction qualifies for SMC-K at approximately $130/month additional compensation on top of all other ratings.' },
        { id:'gu_nexus', label:'How is the condition connected to service?', type:'radio', options:['Secondary to PTSD medications (SSRIs/SNRIs cause sexual dysfunction)','Secondary to service-connected diabetes','Secondary to spinal injury or back condition (neurogenic bladder)','Direct in-service injury or infection','PACT Act toxic exposure','Camp Lejeune water contamination','Not yet established — evaluating'] },
      ]
    });
  }

  if (cond === 'eye') {
    steps.push({ id:'eye_main', label:'Eye Conditions', title:'Eye & Vision Conditions', conditionLabel:'Eye Conditions',
      desc:'Eye conditions are rated under DC 6000-6091 based on best corrected visual acuity, visual field defects, and functional impairment. Loss of use of one or both eyes may qualify for Special Monthly Compensation.',
      fields:[
        { id:'eye_condition', label:'Condition(s) — select all that apply', type:'checkbox', options:['Traumatic eye injury (blast, shrapnel, debris)','Corneal scarring or damage','Retinal detachment or damage','Glaucoma','Cataracts — traumatic or service-related','Macular degeneration — service-related','Optic nerve damage','Diplopia (double vision)','Photophobia (extreme light sensitivity)','Night blindness','Laser eye injury from enemy targeting devices','Chemical or thermal eye injury'] },
        { id:'eye_which', label:'Which eye(s) are affected?', type:'radio', options:['Both eyes','Dominant eye only','Non-dominant eye only'] },
        { id:'eye_acuity', label:'Best corrected visual acuity (with glasses or contacts if applicable)', type:'radio', options:['20/200 or worse — severe impairment','20/100 to 20/200 in affected eye(s)','20/50 to 20/100 — moderate impairment','20/40 or better — mild impairment','Normal or near-normal with correction'] },
        { id:'eye_cause', label:'How was the eye condition caused?', type:'radio', options:['Combat or training injury (shrapnel, debris, blast)','Laser exposure — hostile or training device','Chemical exposure','Radiation exposure','Repetitive UV or sunlight exposure in service environment','Secondary to service-connected TBI','Secondary to diabetes or hypertension','Not yet established — evaluating nexus'] },
      ]
    });
  }

  if (cond === 'cold_injury') {
    steps.push({ id:'cold_main', label:'Cold Injuries / Frostbite', title:'Cold Injuries: Frostbite & Residuals', conditionLabel:'Cold Injuries / Frostbite',
      desc:'Cold injuries including frostbite and trench foot are rated under DC 7122 based on residual effects. Veterans who experienced cold injury during service — even if not formally documented at the time — may have a valid claim based on current residual symptoms.',
      fields:[
        { id:'cold_type', label:'Type of cold injury', type:'radio', options:['Frostbite — diagnosed or documented during service','Trench foot or immersion foot','Chilblains (pernio)','Hypothermia — significant episode during service','Cold exposure without formal diagnosis — residuals present now'] },
        { id:'cold_location', label:'Body areas affected (select all that apply)', type:'checkbox', options:['Toes or feet','Fingers or hands','Nose or ears','Face','Other areas'] },
        { id:'cold_residuals', label:'Current residual symptoms (select all that apply)', type:'checkbox', options:['Raynaud\'s phenomenon — exaggerated cold/color response','Chronic pain in affected areas','Numbness or loss of sensation','Hyperhidrosis (excessive sweating)','Skin color changes (mottling or blueness)','Tissue loss at tip of finger or toe','Increased cold sensitivity','Burning or tingling in affected areas'] },
        { id:'cold_severity', label:'Severity of current residuals', type:'radio', options:['Severe — major tissue loss or complete loss of sensation','Moderate — significant ongoing symptoms affecting daily function','Mild — noticeable but not significantly limiting','Minimal — occasional symptoms only'] },
        { id:'cold_service_link', label:'When and how did the cold injury occur?', type:'radio', options:['Combat operations in cold weather theater','Training operations (winter training, cold weather school)','Occupation in extreme cold environment without adequate gear','Korea service (1950-1953) — special cold injury provisions apply','Extended field operations — inadequate cold weather equipment'] },
      ]
    });
  }

  if (cond === 'radiculopathy') {
    steps.push({ id:'rad_main', label:'Radiculopathy / Nerve', title:'Radiculopathy & Peripheral Nerve Conditions', conditionLabel:'Radiculopathy / Nerve',
      desc:'Radiculopathy — nerve root compression causing radiating pain, numbness, or weakness — is rated separately from the underlying back or neck condition. Veterans with a service-connected back or neck condition who also have radiculopathy should claim it as a separate secondary condition. Each extremity is rated independently.',
      fields:[
        { id:'rad_location', label:'Where does the radiculopathy affect you?', type:'checkbox', options:['Right leg or sciatic nerve','Left leg or sciatic nerve','Both legs','Right arm or brachial plexus','Left arm or brachial plexus','Both arms'] },
        { id:'rad_severity', label:'Severity of nerve symptoms in the most affected extremity', type:'radio', options:['Complete — total loss of function or paralysis (80% level)','Severe — significantly decreased sensation and marked muscle atrophy (60% level)','Moderately severe — marked decreased sensation and muscle weakness (40% level)','Moderate — moderate decreased sensation and some weakness (20% level)','Mild — mild numbness or tingling, no motor weakness (10% level)'] },
        { id:'rad_symptoms', label:'Specific symptoms (select all that apply)', type:'checkbox', options:['Shooting or radiating pain down the leg or arm','Numbness or tingling','Weakness — difficulty walking, lifting, or gripping','Muscle atrophy — visible shrinking of muscle','Loss of reflexes','Foot drop (inability to lift front of foot)','Difficulty with fine motor tasks'] },
        { id:'rad_diagnosis', label:'Diagnosis confirmation', type:'radio', options:['Confirmed by EMG/nerve conduction study','Confirmed by MRI showing nerve compression','Diagnosed clinically by VA provider','Diagnosed on active duty','Diagnosed by private neurologist','Self-reported symptoms — not yet formally confirmed'] },
        { id:'rad_nexus', label:'Underlying cause of radiculopathy', type:'radio', options:['Service-connected lumbar (lower back) condition','Service-connected cervical (neck) condition','Service-connected TBI','Direct nerve injury during service','Not yet formally linked — evaluating nexus'] },
      ]
    });
  }

  return steps;
}

// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
var CONDITION_MAP = {
  ptsd: ['ptsd','mental','anxiety','depression','mst','trauma'],
  back: ['back','spine','lumbar','cervical','thoracic','neck'],
  knee: ['knee','meniscus','ligament','patella'],
  tinnitus: ['tinnitus','hearing','ear'],
  sleep_apnea: ['sleep apnea','sleep','apnea','cpap'],
  migraines: ['migraine','headache'],
  tbi: ['tbi','traumatic brain','concussion'],
  hypertension: ['hypertension','blood pressure','cardiac'],
  shoulder: ['shoulder','rotator','cuff'],
  skin: ['skin','eczema','dermatitis','scar','burn pit'],
  respiratory: ['respiratory','asthma','rhinitis','sinusitis','lung'],
  feet: ['feet','ankle','plantar','flat feet'],
  hip: ['hip','bursitis','avascular'],
  elbow_wrist_hand: ['elbow','wrist','hand','carpal','grip','finger'],
  neck: ['neck','cervical','whiplash'],
  mental_health: ['depression','anxiety','bipolar','ocd','adjustment'],
  mst: ['mst','military sexual','sexual trauma','sexual assault'],
  diabetes: ['diabetes','blood sugar','insulin','diabetic'],
  heart: ['heart','cardiac','coronary','artery','cad','myocardial'],
  gerd_gi: ['gerd','acid reflux','heartburn','ibs','crohn','colitis','gastro'],
  gulfwar: ['gulf war','gulf war illness','unexplained','fibromyalgia','chronic fatigue'],
  cancer: ['cancer','tumor','malignancy','leukemia','lymphoma','oncology'],
  genitourinary: ['kidney','bladder','urinary','erectile','sexual dysfunction','prostate'],
  eye: ['eye','vision','sight','blind','retina','cornea','glaucoma'],
  cold_injury: ['frostbite','cold injury','trench foot','raynaud','chilblain'],
  radiculopathy: ['radiculopathy','nerve','sciatic','numb','tingling','radiating'],
};

// ══════════════════════════════════════════════════════════════════
// RATING ENGINES
// ══════════════════════════════════════════════════════════════════


  // -- Build Complete Steps Array --------------------------------
  function buildSteps(conditions) {
    var steps = _serviceSteps();

    conditions.forEach(function(cond) {
      var condSteps = getConditionSteps(cond);
      // Mark first step for each condition (for trigger warnings)
      if (condSteps.length > 0) {
        condSteps[0]._isFirstForCondition = true;
        condSteps[0].conditionKey = cond;
      }
      for (var i = 0; i < condSteps.length; i++) {
        condSteps[i].conditionKey = cond;
        steps.push(condSteps[i]);
      }
    });

    var ctx = _contextSteps();
    for (var i = 0; i < ctx.length; i++) {
      steps.push(ctx[i]);
    }

    return steps;
  }

  // -- Public API ------------------------------------------------
  return {
    getConditionSteps: getConditionSteps,
    buildSteps: buildSteps
  };

})();
