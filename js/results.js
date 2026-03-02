// ==================================================================
// Decode38 -- Results Data (Translations, Secondary Conditions, C&P Tips)
// ==================================================================
Decode38.Results = (function() {
  'use strict';

  // Helper: replaces .includes() which we converted to .indexOf()
  function has(arr, val) {
    if (!arr) return false;
    if (typeof arr === 'string') return arr.indexOf(val) > -1;
    if (Array.isArray(arr)) return arr.indexOf(val) > -1;
    return false;
  }

function getSecondaryConditions(conditions, a) {
  var secs = [];
  var hasPTSD = has(conditions, 'ptsd');
  var hasBack = has(conditions, 'back');
  var hasTBI = has(conditions, 'tbi');

  if (hasPTSD && !has(conditions, 'sleep_apnea')) {
    if (a.ptsd_sleep && !has(a.ptsd_sleep, 'adequate')) {
      secs.push({ name:'Sleep Apnea (DC 6847)', priority:'hi', reason:'Severe sleep disruption strongly linked to obstructive sleep apnea secondary to PTSD. Requires a sleep study but the CPAP rating alone is 50%.' });
    }
  }
  if (hasPTSD && !has(conditions, 'hypertension')) {
    secs.push({ name:'Hypertension (DC 7101)', priority:'med', reason:'Chronic PTSD stress response is medically documented to elevate blood pressure. If you have been diagnosed with hypertension, this qualifies as a secondary condition.' });
  }
  if (hasPTSD) {
    secs.push({ name:'GERD / Acid Reflux (DC 7346)', priority:'low', reason:'Chronic stress from PTSD is a documented cause of GERD. If you have heartburn or reflux, this may qualify as service-connected secondary to PTSD.' });
    secs.push({ name:'IBS / Irritable Bowel Syndrome (DC 7319)', priority:'low', reason:'PTSD is directly associated with functional gastrointestinal disorders. Alternating constipation/diarrhea and abdominal pain are common presentations.' });
    secs.push({ name:'Erectile Dysfunction / Sexual Dysfunction (SMC-K)', priority:'med', reason:'PTSD-related medications (SSRIs, SNRIs) and psychological factors cause sexual dysfunction. May qualify for Special Monthly Compensation (SMC-K).' });
  }
  if (hasBack && !has(conditions, 'knee')) {
    secs.push({ name:'Radiculopathy — Legs (DC 8520/8521)', priority:'hi', reason:'If your back condition causes radiating pain, numbness, or weakness into your legs, radiculopathy should be rated SEPARATELY in addition to the back rating — not included in it.' });
  }
  if (hasBack) {
    secs.push({ name:'Hip / Knee Degeneration (DC 5252/5257)', priority:'med', reason:'Chronic back conditions alter gait and biomechanics, leading to secondary degeneration of hips and knees over time.' });
  }
  if (hasTBI && !has(conditions, 'ptsd')) {
    secs.push({ name:'PTSD / Mental Health (DC 9411)', priority:'hi', reason:'TBI and PTSD are highly co-morbid. If you have been diagnosed with PTSD following TBI, both should be claimed — they rate separately under current VA policy.' });
  }
  if (hasTBI && !has(conditions, 'migraines')) {
    secs.push({ name:'Migraines (DC 8100)', priority:'hi', reason:'Post-traumatic headache is one of the most common TBI residuals and should be rated separately under DC 8100.' });
  }
  if (hasTBI && !has(conditions, 'tinnitus')) {
    secs.push({ name:'Tinnitus / Hearing Loss (DC 6260)', priority:'med', reason:'Blast-induced TBI commonly causes tinnitus and noise-induced hearing loss, which rate separately.' });
  }

  // TDIU suggestion -- detect unemployability signals across any condition
  var unemployable = (
    (a.ptsd_employment && has(a.ptsd_employment, 'Unable to work')) ||
    (a.mh_employment && has(a.mh_employment, 'Unable to work')) ||
    (a.tbi_work && has(a.tbi_work, 'Total')) ||
    (a.back_work && has(a.back_work, 'Cannot perform')) ||
    (a.neck_work && has(a.neck_work, 'Cannot perform'))
  );
  if (unemployable) {
    secs.push({ name:'TDIU — Total Disability Individual Unemployability (38 CFR § 4.16)', priority:'hi', reason:'You reported being unable to work due to your service-connected condition(s). TDIU pays at the 100% rate even if your combined rating is below 100%. Single condition 60%+ or combined 70%+ (with one condition at 40%+) qualifies. File VA Form 21-8940 and employer/education records.' });
  }
  var hasPACT = (a.deployments && /iraq|afghanistan|kuwait|djibouti|gulf/i.test(a.deployments)) ||
    (a.resp_pact && has(a.resp_pact, 'Yes')) || (a.skin_pact && has(a.skin_pact, 'Yes'));
  if (hasPACT) {
    secs.push({ name:'PACT Act Presumptive Conditions', priority:'hi', reason:'Your deployment history may qualify for PACT Act (2022) presumptive service connection — no nexus proof required. Conditions include: respiratory, skin, and certain cancers. Strongly recommend VSO evaluation.' });
  }

  return secs;
}

// ══════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════════


function getAllTranslations(conditions, a) {
  var t = [];
  if (has(conditions, 'ptsd')) {
    if (a.ptsd_sleep && !has(a.ptsd_sleep, 'adequate')) t.push({ layman:"I can't sleep — maybe a few hours a night", va:"Chronic sleep impairment with difficulty initiating and maintaining sleep, consistent with PTSD hyperarousal (DSM-5 criterion E6)" });
    if (a.ptsd_nightmares && a.ptsd_nightmares !== 'Rarely or never') t.push({ layman:"I have nightmares about what happened in service", va:"Recurrent distressing dreams directly related to the traumatic event, consistent with PTSD intrusion criterion (DSM-5 B2)" });
    if (a.ptsd_flashbacks && a.ptsd_flashbacks !== 'Have not experienced flashbacks') t.push({ layman:"Sometimes I feel like I'm right back there", va:"Dissociative reactions (flashbacks) in which the individual feels or acts as if the traumatic event is recurring (DSM-5 criterion B3)" });
    if (a.ptsd_panic && a.ptsd_panic !== 'Have not experienced panic attacks') t.push({ layman:"I get sudden overwhelming waves of panic", va:"Panic attacks with physiological reactivity to trauma-related cues, occurring at reported frequency (DSM-5 criterion B5)" });
    if (a.ptsd_avoidance && !has(a.ptsd_avoidance, 'Minimal')) t.push({ layman:"I avoid certain places and people that remind me of what happened", va:"Persistent effortful avoidance of distressing trauma-related external reminders — persons, places, conversations, activities, objects (DSM-5 criterion C2)" });
    if (a.ptsd_numbing && !has(a.ptsd_numbing, 'Rarely')) t.push({ layman:"I feel emotionally numb — I can't feel anything anymore", va:"Persistent inability to experience positive emotions; emotional numbing; feelings of detachment or estrangement from others (DSM-5 criterion D7)" });
    if (a.ptsd_irritability && !has(a.ptsd_irritability, 'Rarely')) t.push({ layman:"I get angry or irritable for no reason", va:"Irritable behavior and angry outbursts with little or no provocation, typically expressed as verbal or physical aggression (DSM-5 criterion E1)" });
    if (a.ptsd_startle && !has(a.ptsd_startle, 'No')) t.push({ layman:"Loud noises make me jump out of my skin", va:"Exaggerated startle response to auditory and visual stimuli (DSM-5 criterion E5 — hypervigilance and heightened arousal)" });
    if (a.ptsd_memory && !has(a.ptsd_memory, 'Not significant')) t.push({ layman:"My memory is terrible — I forget everything", va:"Impaired short and long-term memory; inability to recall important aspects of traumatic events; trauma-related cognitive alterations (DSM-5 criterion D1)" });
    if (a.ptsd_employment === 'Unable to work at all due to PTSD') t.push({ layman:"I can't hold a job because of my PTSD", va:"Occupational and social impairment with deficiencies in most areas — work, family, judgment, thinking, or mood — resulting in inability to maintain gainful employment (38 CFR § 4.130 / 70% threshold; basis for TDIU claim under 38 CFR § 4.16)" });
    if (a.ptsd_suicidal === 'Yes — I have had these thoughts') t.push({ layman:"I've had thoughts of not wanting to be here / harming myself", va:"Suicidal ideation — a key clinical indicator for 70% rating under the General Rating Formula for Mental Disorders (38 CFR § 4.130)" });
    if (a.ptsd_relationships && !has(a.ptsd_relationships, 'Mild')) t.push({ layman:"My family says I'm a completely different person", va:"Marked alterations in arousal and reactivity; persistent negative alterations in mood as corroborated by family members; inability to maintain effective personal relationships (DSM-5 criteria D and E)" });
  }
  if (has(conditions, 'back')) {
    t.push({ layman:"My back is always hurting", va:"Chronic lumbosacral strain with characteristic pain on motion and limitation of range of motion; symptomatic intervertebral disc disease" });
    if (a.back_radiculopathy && !has(a.back_radiculopathy, 'No')) t.push({ layman:"The pain shoots down my leg", va:"Lumbosacral radiculopathy with radiation of pain, paresthesias, or sensory loss into the lower extremities — rated separately under DC 8520/8521" });
    if (a.back_flareup && has(a.back_flareup, 'Yes')) t.push({ layman:"Some days I can barely get out of bed", va:"Incapacitating episodes of intervertebral disc syndrome — periods of acute signs and symptoms that require bed rest and treatment by a physician" });
  }
  if (has(conditions, 'knee')) {
    if (a.knee_instability && !has(a.knee_instability, 'No')) t.push({ layman:"My knee gives out on me", va:"Recurrent subluxation or lateral instability of the knee — rated under DC 5257 based on severity: mild (10%), moderate (20%), or severe (30%)" });
    if (a.knee_flexion && !has(a.knee_flexion, 'Greater')) t.push({ layman:"I can't fully bend my knee", va:"Limitation of flexion of the leg — rated under DC 5260; measurement at the point of pain on range of motion testing is used for rating purposes" });
    t.push({ layman:"My knee hurts when I walk", va:"Painful motion of the knee with weight-bearing ambulation; functional loss due to pain on motion (38 CFR § 4.40, 4.45)" });
  }
  if (has(conditions, 'tinnitus')) {
    t.push({ layman:"My ears ring constantly", va:"Recurrent tinnitus — subjective head or ear noise, rated at 10% under DC 6260 (maximum rating for tinnitus alone)" });
    t.push({ layman:"It's worse after being around noise", va:"Tinnitus exacerbated by noise exposure; consistent with noise-induced etiology from military occupational noise exposure" });
  }
  if (has(conditions, 'sleep_apnea')) {
    t.push({ layman:"I stop breathing in my sleep and wake up gasping", va:"Obstructive sleep apnea with apneic episodes during sleep; polysomnographic documentation; CPAP/BiPAP requirement — basis for 50% rating under DC 6847" });
    t.push({ layman:"I'm exhausted all day no matter how much I sleep", va:"Persistent daytime hypersomnolence (excessive daytime sleepiness) secondary to sleep-disordered breathing — basis for 30% rating under DC 6847" });
  }
  if (has(conditions, 'migraines')) {
    t.push({ layman:"My headaches are so bad I have to lie in a dark room", va:"Prostrating migraine attacks — attacks of such severity that the claimant must stop all activity and lie down; the frequency of prostrating attacks determines rating under DC 8100" });
    t.push({ layman:"The headaches wipe me out for hours", va:"Completely prostrating and prolonged migraine attacks with productive economic inadaptability; attacks occurring at reported frequency over the past 12 months" });
    if (a.mig_triggers && has(a.mig_triggers, 'Noise / loud sounds')) t.push({ layman:"Loud noises trigger my headaches", va:"Migraine with hyperacusis (sensitivity to noise) as a precipitating factor; consistent with post-traumatic headache secondary to noise exposure or TBI" });
    if (a.mig_triggers && has(a.mig_triggers, 'Light sensitivity')) t.push({ layman:"Light makes my headaches worse — I have to stay in the dark", va:"Migraine with photophobia (sensitivity to light) as a characteristic feature; requires isolation in dark room during attacks" });
    if (a.mig_work && !has(a.mig_work, 'Minimal')) t.push({ layman:"My headaches make it impossible to function at work", va:"Economic inadaptability due to migraine attacks; inability to maintain regular work attendance or productivity during and following prostrating episodes" });
  }
  if (has(conditions, 'tbi')) {
    t.push({ layman:"I hit my head / was near a blast and haven't been the same since", va:"Traumatic brain injury (TBI) with residual cognitive, emotional, and physical sequelae — rated under DC 8045 based on severity of residuals across ten functional domains" });
    if (a.tbi_cognitive && has(a.tbi_cognitive, 'Memory problems — short or long term')) t.push({ layman:"My memory is shot — I forget things constantly", va:"Neurocognitive impairment with short and long-term memory deficits secondary to TBI; rated under the cognitive domain of DC 8045 (Traumatic Brain Injury)" });
    if (a.tbi_cognitive && has(a.tbi_cognitive, 'Concentration and attention difficulties')) t.push({ layman:"I can't focus on anything for more than a few minutes", va:"Attention, concentration, and executive function deficits secondary to TBI; impaired ability to sustain attention and complete multi-step tasks" });
    if (a.tbi_cognitive && has(a.tbi_cognitive, 'Word-finding problems (aphasia)')) t.push({ layman:"I lose words mid-sentence — I know what I want to say but can't get it out", va:"Expressive aphasia / word-finding difficulty secondary to TBI; language processing impairment affecting verbal communication" });
    if (a.tbi_cognitive && has(a.tbi_cognitive, 'Behavioral changes — irritability, impulsivity')) t.push({ layman:"I get angry out of nowhere — my personality has changed", va:"Behavioral dysregulation secondary to TBI; disinhibition, irritability, and impulsivity resulting from frontal lobe involvement; persistent personality change" });
    if (a.tbi_physical && has(a.tbi_physical, 'Chronic headaches / migraines')) t.push({ layman:"I've had constant headaches since the blast / injury", va:"Post-traumatic headache secondary to TBI — should be claimed and rated separately under DC 8100 in addition to the primary TBI rating" });
    if (a.tbi_physical && has(a.tbi_physical, 'Dizziness or balance problems')) t.push({ layman:"I get dizzy and lose my balance — I've fallen", va:"Vestibular dysfunction secondary to TBI; vertigo and balance impairment resulting from traumatic injury to the vestibular system or cerebellum" });
    if (a.tbi_physical && has(a.tbi_physical, 'Seizures')) t.push({ layman:"I've had seizures since my head injury", va:"Post-traumatic seizure disorder secondary to TBI — rated separately under DC 8910-8914; frequency of seizures determines the separate seizure rating" });
    if (a.tbi_work && !has(a.tbi_work, 'Minimal')) t.push({ layman:"My TBI has made it impossible to hold a normal job", va:"Occupational and social impairment due to TBI residuals; cognitive, behavioral, and physical deficits result in inability to maintain effective employment — basis for evaluating TDIU under 38 CFR § 4.16" });
  }
  if (has(conditions, 'hypertension')) {
    t.push({ layman:"I have high blood pressure", va:"Hypertension with diastolic blood pressure readings as documented — rated under DC 7101 based on predominant diastolic pressure level and medication requirement" });
    if (a.htn_meds && !has(a.htn_meds, 'No medication')) t.push({ layman:"I have to take medication every day to control my blood pressure", va:"Hypertension requiring continuous medication for control — a basis for minimum 10-20% rating under DC 7101 regardless of controlled readings" });
    if (a.htn_nexus && has(a.htn_nexus, 'Chronic PTSD')) t.push({ layman:"My doctor says my stress from the military caused my blood pressure problems", va:"Hypertension secondary to PTSD — the chronic sympathetic nervous system activation and stress response from PTSD is a documented medical cause of sustained hypertension; claim as secondary condition under 38 CFR § 3.310" });
    if (a.htn_cardiac === 'Yes — echocardiogram showing cardiac enlargement') t.push({ layman:"My heart has gotten bigger from the high blood pressure", va:"Hypertensive heart disease with cardiac hypertrophy (cardiomegaly) documented on echocardiogram — basis for 60% rating under DC 7101" });
  }
  if (has(conditions, 'shoulder')) {
    t.push({ layman:"I can't raise my arm very high", va:"Limitation of motion of the arm — rated under DC 5201 based on the degree of abduction (raising the arm out to the side); dominant arm receives a 10% higher rating than non-dominant" });
    if (a.shoulder_condition && has(a.shoulder_condition, 'Rotator cuff tear')) t.push({ layman:"I tore my rotator cuff in the military", va:"Rotator cuff tear with residual limitation of motion and painful arc of movement; functional loss due to pain, weakness, and restricted range of motion (38 CFR § 4.40, 4.45)" });
    if (a.shoulder_condition && has(a.shoulder_condition, 'instability')) t.push({ layman:"My shoulder pops out / dislocates", va:"Recurrent shoulder subluxation or dislocation with residual instability; evaluated under DC 5201 and 5203 for limitation of motion and functional loss" });
    if (a.shoulder_condition && has(a.shoulder_condition, 'Post-surgical')) t.push({ layman:"I had surgery on my shoulder while in the military", va:"Status post shoulder surgery with residual limitation of motion, pain, and weakness; service connection established by in-service surgical procedure documented in STRs" });
    t.push({ layman:"My shoulder hurts when I try to reach or lift", va:"Painful motion and functional loss of the shoulder with weight-bearing and overhead activity; characteristic pain on motion documented at range of motion limits (38 CFR § 4.45)" });
  }
  if (has(conditions, 'skin')) {
    t.push({ layman:"I have a skin condition that flares up and won't go away", va:"Chronic dermatological condition rated under DC 7806 (dermatitis/eczema) or applicable code based on percentage of body surface area affected and treatment required" });
    if (a.skin_pact && has(a.skin_pact, 'Yes') && has(a.skin_pact, 'burn pit')) t.push({ layman:"My skin problems started after I was stationed near burn pits", va:"Dermatological condition secondary to burn pit / toxic exposure during qualifying Southwest Asia service — PACT Act (2022) presumptive service connection; no nexus letter required for qualifying veterans" });
    if (a.skin_treatment && has(a.skin_treatment, 'Systemic therapy')) t.push({ layman:"I need strong prescription medications to control my skin condition", va:"Dermatological condition requiring systemic therapy (oral corticosteroids, immunosuppressants, or biologics) for 6 or more weeks per year — basis for 30-60% rating under DC 7806" });
    if (a.skin_type && has(a.skin_type, 'Scars')) t.push({ layman:"I have scars from my service — they're painful or disfiguring", va:"Residual scars (DC 7800-7805) rated based on area, location, whether painful or unstable, and degree of disfigurement; painful or unstable scars rate separately regardless of size" });
    if (a.skin_body_area && (has(a.skin_body_area, '20-40%') || has(a.skin_body_area, 'More than 40%'))) t.push({ layman:"My skin condition covers a large part of my body", va:"Generalized dermatological involvement affecting 20-40%+ of total body surface area; severity and extent of involvement are primary rating factors under DC 7806" });
  }
  if (has(conditions, 'respiratory')) {
    t.push({ layman:"I have trouble breathing / my lungs aren't right since I got out", va:"Respiratory condition rated based on pulmonary function testing (FEV-1 and FEV-1/FVC ratio), frequency of incapacitating episodes, and treatment required; rated under applicable diagnostic code" });
    if (a.resp_pact && has(a.resp_pact, 'Yes')) t.push({ layman:"I think my breathing problems are from burn pits or toxic exposure overseas", va:"Respiratory condition secondary to qualifying toxic exposure during Southwest Asia service — PACT Act (2022) presumptive service connection applies; conditions include constrictive bronchiolitis, constrictive pericarditis, and other covered illnesses; no nexus required for qualifying veterans" });
    if (a.resp_type && has(a.resp_type, 'Asthma')) t.push({ layman:"I developed asthma in the military or after I got out", va:"Bronchial asthma (DC 6602) rated based on FEV-1 % of predicted value, FEV-1/FVC ratio, and frequency of attacks requiring systemic corticosteroids; minimum 10% if requiring bronchodilator use more than occasionally" });
    if (a.resp_type && has(a.resp_type, 'sinusitis')) t.push({ layman:"I have constant sinus infections and congestion since service", va:"Chronic sinusitis (DC 6513/6514) with recurrent incapacitating episodes; rated based on frequency of non-incapacitating exacerbations with purulent discharge, polyps, or headaches" });
    if (a.resp_work && !has(a.resp_work, 'Minimal')) t.push({ layman:"I can't do anything physical without getting winded", va:"Functional impairment due to respiratory disease with exertional limitation; unable to perform duties requiring physical exertion due to dyspnea on exertion — basis for unemployability evaluation if sedentary employment also limited" });
  }
  if (has(conditions, 'feet')) {
    t.push({ layman:"My feet hurt all the time from everything I did in the military", va:"Chronic foot condition with painful weight-bearing ambulation secondary to cumulative occupational stress during military service; rated under applicable diagnostic code based on degree of functional impairment" });
    if (a.feet_type && has(a.feet_type, 'Plantar fasciitis')) t.push({ layman:"The bottom of my foot / heel kills me every time I stand up", va:"Plantar fasciitis with chronic heel pain on weight-bearing; characteristic morning pain and tenderness along the plantar fascia; rated under DC 5284 (other foot injuries) based on severity" });
    if (a.feet_type && has(a.feet_type, 'Pes planus')) t.push({ layman:"I have flat feet — the military made it worse", va:"Pes planus (DC 5276) with symptoms of pain on use, swelling on use, or characteristic calluses; mild (0-10%), moderate (10%), or severe (20-30%) based on degree of deformity and symptoms" });
    if (a.feet_type && has(a.feet_type, 'Ankle instability')) t.push({ layman:"My ankle gives out / rolls easily since my service injury", va:"Chronic ankle instability with recurrent sprain and pain on motion; rated under DC 5270-5274 for limitation of motion or DC 5271 for ankle limitation of motion" });
    if (a.feet_both === 'Yes — bilateral (both sides)') t.push({ layman:"Both of my feet are affected", va:"Bilateral foot condition — each foot is rated separately; bilateral factor applies per 38 CFR § 4.68, adding 10% of the combined value of both ratings to the final combined rating" });
  }
  if (has(conditions, 'hip')) {
    t.push({ layman:"My hip hurts and I can barely lift my leg", va:"Limitation of flexion of the hip — rated under DC 5252 based on degrees of flexion; painful and limited motion with weight-bearing ambulation (38 CFR § 4.40, 4.45)" });
    if (a.hip_which === 'Both hips') t.push({ layman:"Both of my hips are bad", va:"Bilateral hip conditions — each hip rated separately under DC 5252; bilateral factor applied under 38 CFR § 4.68" });
    if (a.hip_condition && has(a.hip_condition, 'Avascular necrosis')) t.push({ layman:"The bone in my hip is dying from an injury or medication", va:"Avascular necrosis (osteonecrosis) of the femoral head — rated based on resulting limitation of motion; may be secondary to corticosteroid treatment or traumatic injury during service" });
  }
  if (has(conditions, 'elbow_wrist_hand')) {
    t.push({ layman:"I can't grip things well / my hand doesn't work right", va:"Limitation of motion and functional loss of the upper extremity — rated under applicable DC (5151+) based on range of motion, grip strength, and dominant vs. non-dominant status; functional loss due to pain evaluated under 38 CFR § 4.40" });
    if (a.ewh_condition && has(a.ewh_condition, 'Carpal tunnel syndrome')) t.push({ layman:"My hand goes numb and tingly, especially at night — carpal tunnel", va:"Carpal tunnel syndrome with median nerve involvement — numbness, tingling, and weakness in the distribution of the median nerve; rated as peripheral nerve injury under DC 8515" });
    if (a.ewh_condition && has(a.ewh_condition, 'Nerve damage')) t.push({ layman:"The nerve in my arm was damaged — things feel numb or weak", va:"Peripheral nerve injury (ulnar, radial, or median nerve) — rated separately based on severity from mild (10%) to complete paralysis (60-80%) under DC 8510-8516" });
  }
  if (has(conditions, 'neck')) {
    t.push({ layman:"My neck is always stiff and painful — I can't turn my head properly", va:"Cervical spine condition with limitation of forward flexion — rated under DC 5237; painful motion measured at the point where pain begins (38 CFR § 4.46)" });
    if (a.neck_radiculopathy && !has(a.neck_radiculopathy, 'No')) t.push({ layman:"Pain shoots down my arm from my neck — my hand goes numb", va:"Cervical radiculopathy with brachial plexus involvement — radiation of pain, paresthesias, or sensory loss into the upper extremity; rated separately from the cervical condition under DC 8510-8516" });
  }
  if (has(conditions, 'mental_health')) {
    t.push({ layman:"I've been depressed since I got out — I can't function like I used to", va:"Major depressive disorder with occupational and social impairment — rated under the General Rating Formula for Mental Disorders (38 CFR § 4.130); functional impact determines rating level" });
    if (a.mh_employment === 'Unable to work at all') t.push({ layman:"My depression or anxiety has made it impossible to hold a job", va:"Occupational impairment with deficiencies in most areas resulting in inability to maintain gainful employment — basis for 70% rating and TDIU evaluation under 38 CFR § 4.16" });
    if (a.mh_social && has(a.mh_social, 'Severe')) t.push({ layman:"I've pushed everyone away — I barely leave the house", va:"Persistent avoidance and social isolation; marked alterations in interpersonal functioning consistent with severe occupational and social impairment (38 CFR § 4.130 — 70% criteria)" });
  }
  if (has(conditions, 'mst')) {
    t.push({ layman:"Something happened to me in the military that I've never gotten over", va:"In-service personal assault / Military Sexual Trauma (MST) — VA does not require a police report or conviction. The resulting psychiatric and physical conditions are service-connected through the MST event. Alternative evidence under 38 CFR § 3.304(f)(5) is accepted." });
    t.push({ layman:"I didn't report it at the time — I didn't think anyone would believe me", va:"VA's relaxed evidentiary standard for MST (38 CFR § 3.304(f)) allows establishment of the in-service stressor through alternative evidence including behavioral changes, requests for transfer, performance changes, or lay statements from peers or family" });
  }
  if (has(conditions, 'diabetes')) {
    t.push({ layman:"I have diabetes — my doctor says it might be from my military service", va:"Diabetes mellitus Type II — rated under DC 7913 based on treatment required and regulation difficulty; Agent Orange exposure (Vietnam), certain PACT Act exposures, and Camp Lejeune contamination create presumptive service connection requiring no nexus proof" });
    if (a.dm_complications && has(a.dm_complications, 'Peripheral neuropathy')) t.push({ layman:"My feet are numb from the diabetes", va:"Diabetic peripheral neuropathy — rated separately from diabetes as an additional service-connected condition under DC 8530; numbness and tingling in the lower extremities secondary to diabetes mellitus" });
  }
  if (has(conditions, 'heart')) {
    t.push({ layman:"I have heart disease / I had a heart attack", va:"Ischemic heart disease (coronary artery disease) — rated under DC 7005 based on workload tolerance in METs and ejection fraction; presumptive for veterans with Agent Orange exposure under 38 CFR § 3.309(e)" });
    if (a.heart_mets && has(a.heart_mets, '3 METs')) t.push({ layman:"I can barely walk up stairs without getting out of breath", va:"Workload limitation of less than 3 METs with dyspnea on mild exertion — basis for 100% rating under DC 7005; chronic congestive heart failure or severe functional limitation" });
  }
  if (has(conditions, 'gerd_gi')) {
    t.push({ layman:"My stomach is always messed up — I have acid reflux and GI problems constantly", va:"Gastroesophageal reflux disease (GERD) with hiatal hernia — rated under DC 7346 based on symptom frequency and severity; secondary to PTSD is a well-established nexus documented in medical literature" });
    if (a.gi_condition && has(a.gi_condition, 'IBS')) t.push({ layman:"I have IBS — I never know when I'm going to have an attack", va:"Irritable bowel syndrome (DC 7319) — functional GI disorder with alternating constipation and diarrhea; secondary to PTSD or chronic stress is medically documented and well-recognized by VA" });
  }
  if (has(conditions, 'gulfwar')) {
    t.push({ layman:"I came back from the Gulf and I've never felt right — doctors can't figure out what's wrong", va:"Chronic multisymptom illness of unknown etiology (Gulf War Illness) — qualifying under 38 CFR § 3.317 as a medically unexplained chronic multisymptom illness (MUCMI); no specific diagnosis required; qualifying Southwest Asia service plus qualifying symptoms present for 6+ months is sufficient for presumptive service connection" });
    t.push({ layman:"I'm exhausted all the time, I hurt everywhere, I can't think straight", va:"Chronic fatigue, widespread musculoskeletal pain, and neurocognitive symptoms consistent with Gulf War Illness — cluster of qualifying symptoms establishing presumptive entitlement under 38 CFR § 3.317 without requirement to identify specific etiology" });
  }
  if (has(conditions, 'cancer')) {
    t.push({ layman:"I was diagnosed with cancer and I think it's from my military service / burn pit exposure", va:"Malignant neoplasm — rated at 100% during active treatment under DC 7343; PACT Act (2022) establishes presumptive service connection for qualifying cancers in veterans with burn pit or airborne hazard exposure; no nexus proof required for qualifying veterans" });
    if (a.cancer_residuals && a.cancer_residuals.length > 0) t.push({ layman:"The cancer is gone but I'm still suffering from the treatment effects", va:"Residuals of malignant neoplasm — peripheral neuropathy from chemotherapy, radiation fibrosis, lymphedema, and organ damage are each rated separately as service-connected residuals after the primary malignancy enters remission" });
  }
  if (has(conditions, 'genitourinary')) {
    t.push({ layman:"My kidneys / bladder aren't right since my service", va:"Genitourinary condition — rated under applicable DC (7500-7542) based on severity of renal function impairment, voiding dysfunction, or other GU pathology; service connection may be established through direct injury, secondary conditions, or toxic exposure" });
    if (a.gu_ed && has(a.gu_ed, 'Complete')) t.push({ layman:"I can't have sex anymore because of my service-connected conditions or medications", va:"Complete organic erectile dysfunction secondary to service-connected condition or treatment — qualifies for Special Monthly Compensation (SMC-K) under 38 CFR § 3.350(a); approximately $130/month additional compensation regardless of combined rating level" });
  }
  if (has(conditions, 'eye')) {
    t.push({ layman:"My eyes were damaged in service — my vision isn't right", va:"Visual impairment secondary to in-service injury or disease — rated under DC 6000-6091 based on best corrected visual acuity in the affected eye(s); Line of Duty finding for combat or training injury strengthens nexus" });
    if (a.eye_condition && has(a.eye_condition, 'Photophobia')) t.push({ layman:"Light hurts my eyes badly — I have to wear sunglasses inside", va:"Photophobia (extreme sensitivity to light) — functional limitation affecting daily activities and employment; often secondary to TBI, corneal injury, or migraine; documented as a separate ratable condition" });
  }
  if (has(conditions, 'cold_injury')) {
    t.push({ layman:"I got frostbite in the military and my hands / feet still have problems", va:"Residuals of cold injury (frostbite) — rated under DC 7122 based on severity of residual symptoms including Raynaud's phenomenon, chronic pain, sensory loss, and tissue loss; cold weather service documented in service records supports nexus" });
    if (a.cold_residuals && has(a.cold_residuals, 'Raynaud\'s phenomenon — exaggerated cold/color response')) t.push({ layman:"My fingers turn white and blue when it's cold and it's very painful", va:"Raynaud's phenomenon secondary to cold injury — vasospastic disorder with exaggerated cold-induced color change and pain; rated as a residual of cold injury under DC 7117 or 7122" });
  }
  if (has(conditions, 'radiculopathy')) {
    t.push({ layman:"Pain shoots down my leg / arm and I get numbness and tingling", va:"Lumbosacral or cervical radiculopathy — nerve root compression causing radiating pain, paresthesias, and sensory or motor deficit in the affected extremity; rated separately from the underlying spinal condition under DC 8520-8730; each extremity rated independently" });
    if (a.rad_symptoms && has(a.rad_symptoms, 'Foot drop (inability to lift front of foot)')) t.push({ layman:"My foot just flops — I trip because I can't lift my foot", va:"Foot drop secondary to common peroneal nerve involvement from lumbar radiculopathy — rated under DC 8521 based on severity; characteristic steppage gait and inability to dorsiflex the foot; typically rates at 40-60% severity level" });
    if (a.rad_symptoms && has(a.rad_symptoms, 'Muscle atrophy — visible shrinking of muscle')) t.push({ layman:"My leg/arm is getting smaller — the muscle is wasting away", va:"Neurogenic muscle atrophy — visible circumferential reduction of the affected extremity indicating severe or complete nerve involvement; basis for 60-80% rating under applicable peripheral nerve DC" });
  }
  return t;
}

// ══════════════════════════════════════════════════════════════════
// C&P TIPS
// ══════════════════════════════════════════════════════════════════


function getCPTips(conditions, a) {
  var tips = [
    { urgent:false, text:'<strong>Be honest — not strategic.</strong> VA raters and C&P examiners are trained to identify inconsistencies. Your job is not to perform for the exam; it is to give an accurate account of how your conditions actually affect your life. Honesty is not only the right approach — it is the most effective one.' },
    { urgent:false, text:'<strong>Describe your worst days, not your best.</strong> VA compensation is based on the full range of your condition over the past 12 months. If your worst days are significantly worse than your average, say so plainly. Describing only your good days is one of the most common reasons veterans are under-compensated.' },
    { urgent:false, text:'<strong>Be specific about frequency and duration.</strong> "Sometimes" is not a useful answer in a VA context. Say "three times a week," "every morning for about two hours," or "I missed work four times last month." Specificity is what gets translated into a compensation level.' },
    { urgent:false, text:'<strong>Connect every symptom to what it prevents you from doing.</strong> Do not just list symptoms — describe the functional impact. "I avoid grocery stores" is weaker than "I have not been inside a grocery store in four months because of crowds and noise." The second statement describes functional loss, which is what VA rates.' },
    { urgent:false, text:'<strong>Bring documentation.</strong> Medication list, treatment records, buddy statements from fellow service members or family, and any work records showing absences, terminations, or performance issues related to your conditions.' },
    { urgent:false, text:'<strong>Do not minimize or tough it out in the exam room.</strong> Military culture teaches you to push through pain and project strength. In a C&P exam, that instinct works against you. You are not complaining — you are giving a factual account of conditions you earned the right to claim.' },
  ];

  if (has(conditions, 'ptsd')) {
    if (a.ptsd_panic && (has(a.ptsd_panic, 'once a week') || has(a.ptsd_panic, 'Daily'))) {
      tips.push({ urgent:true, text:'<strong>Panic attack frequency determines your compensation threshold.</strong> More than once per week is the 50% threshold. State the exact frequency and describe the full experience — chest tightening, racing heart, difficulty breathing, sense of losing control. Do not round down.' });
    }
    if (a.ptsd_suicidal === 'Yes — I have had these thoughts') {
      tips.push({ urgent:true, text:'<strong>Disclose suicidal ideation directly to your examiner.</strong> This is a primary clinical indicator for the 70% compensation level. Veterans frequently omit this out of shame or fear — but omitting it results in an incomplete record and an inaccurate compensation level. If you are in crisis now, call 988 and press 1.' });
    }
    if (a.ptsd_employment === 'Unable to work at all due to PTSD') {
      tips.push({ urgent:true, text:'<strong>Ask your examiner to document occupational impairment explicitly.</strong> If PTSD prevents gainful employment, you may qualify for TDIU — 100% compensation pay regardless of your combined percentage. Bring documentation of any job losses, reduced hours, or employer accommodations.' });
    }
  }
  if (has(conditions, 'back')) {
    tips.push({ urgent:false, text:'<strong>Range of motion is measured at the point where pain begins — not where movement stops.</strong> If bending forward causes pain at 30 degrees, that is your functional limit even if you can physically push to 60. Tell the examiner exactly where pain starts. This is the legally correct standard under 38 CFR § 4.46.' });
    tips.push({ urgent:false, text:'<strong>Report flare-ups separately from your baseline.</strong> If your back condition is significantly worse during flare-ups, describe the frequency and severity. The VA must consider flare-up severity in its rating — but only if you disclose it.' });
  }
  if (has(conditions, 'tinnitus')) {
    tips.push({ urgent:false, text:'<strong>Use the word "recurrent" when describing tinnitus.</strong> The VA rating criteria is written around recurrent tinnitus — even if your tinnitus is constant, the regulatory language to use is "recurrent tinnitus in one or both ears." This is not exaggeration; it is precision.' });
  }
  if (has(conditions, 'sleep_apnea')) {
    tips.push({ urgent:false, text:'<strong>If you have a CPAP prescription, bring documentation of it.</strong> The CPAP requirement alone is the basis for 50% compensation under DC 6847. If prescribed but not tolerated, say so — the prescription still establishes the 50% level.' });
  }
  if (a.service_status && has(a.service_status, 'Active Duty')) {
    tips.push({ urgent:false, text:'<strong>Active duty members can begin the claims process 180 days before separation.</strong> File a Benefits Delivery at Discharge (BDD) claim through your installation TAP office. Starting early eliminates gaps in compensation after you separate.' });
  }
  if (a.service_status && (has(a.service_status, 'Guard') || has(a.service_status, 'Reserve'))) {
    tips.push({ urgent:false, text:'<strong>Guard and Reserve members: your activation orders are critical evidence.</strong> VA service connection requires the condition to have occurred during or been aggravated by federal service under Title 10 orders. Keep copies of all DD-214s and activation orders.' });
  }
  return tips;
}

// ══════════════════════════════════════════════════════════════════
// AI STATEMENT
// ══════════════════════════════════════════════════════════════════



  // -- Public API ------------------------------------------------
  return {
    getSecondaryConditions: getSecondaryConditions,
    getAllTranslations: getAllTranslations,
    getCPTips: getCPTips
  };

})();
