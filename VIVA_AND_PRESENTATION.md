# CareSync: Campus Placement Viva & Technical Interview Guide

This guide prepares final-year CSE students to present, explain, and defend the **CareSync** platform during campus placement interviews, external viva examinations, and technical project defenses.

---

## 📋 Project Presentation Pitch (2-Minute Elevator Pitch)

> *"Good morning, panel. Our project is **CareSync – Intelligent Preventive Healthcare & Patient Monitoring Platform**.
>
> Traditional healthcare systems suffer from two major flaws: they are **reactive**—acting only after a patient reaches acute distress—and their digital trackers rely on **static threshold limits** that miss insidious, gradual vital deterioration.
>
> CareSync introduces three key innovations:
> 1. **Explainable Health Trend Intelligence:** Instead of binary alarms, CareSync compares rolling baselines over 7 to 30 days to detect upward or downward trajectories (e.g. a gradual 16% rise in systolic blood pressure) and produces human-readable mathematical reasons explaining why the alert fired.
> 2. **Sovereign Consent Ledger:** Unlike all-or-nothing medical apps, patients have granular control over what specific doctors can inspect (vitals, medications, symptoms, or lab files) with instant revocation.
> 3. **AI Clinical Briefing Assistant:** It synthesizes multi-stream telemetry, adherence rates, and symptoms into a structured pre-consultation summary equipped with focused questions the patient should bring to their doctor.
>
> The stack is built on Node.js, Express, MongoDB with Mongoose, React 18 with Vite, and Tailwind CSS, featuring role-based authorization, rate limiting, and zero external dependency execution via an embedded fallback."*

---

## 🎓 10 Technical Viva Questions & Bulletproof Model Answers

### Question 1: How does your Health Trend Intelligence differ from a simple `if (vital > threshold)` check?
**Model Answer:**  
> *"A simple `if (vital > 140)` check is static and blind to trajectory. For instance, if a patient's baseline systolic blood pressure is normally 105 mmHg, a gradual increase to 135 mmHg over 5 days represents significant arterial strain (+28% increase), yet a static threshold set at 140 mmHg would remain completely silent.
>
> In CareSync, the `TrendIntelligenceService` partitions chronological readings over a time window into baseline and recent subsets. It computes rolling arithmetic means:
> $$\Delta\% = \frac{\bar{x}_{\text{recent}} - \bar{x}_{\text{baseline}}}{\bar{x}_{\text{baseline}}} \times 100$$
> If $\Delta\%$ exceeds 8–10% and recent values exceed pre-hypertensive bounds, CareSync flags an upward trend alert and outputs the exact delta and baseline in the alert's explainable `reason` attribute."*

---

### Question 2: Why did you choose MongoDB and Mongoose over a traditional Relational Database (SQL)?
**Model Answer:**  
> *"We selected MongoDB with Mongoose ODM for three primary architectural reasons:
> 1. **Flexible, Evolving Health Schemas:** Health parameters vary widely across patient profiles—some track blood glucose type (fasting vs. post-prandial), while others track SpO2 or lifestyle habits. MongoDB's document model allows structured embedding without requiring complex database schema alterations.
> 2. **Time-Series Telemetry Querying:** Mongoose compound indexing (e.g., `{ patient: 1, recordedAt: -1 }`) allows rapid $O(\log N)$ range-based queries on chronological readings for our trend algorithms.
> 3. **Embedded Fallback Capability:** For development and campus placement demonstration, MongoDB can run seamlessly via `mongodb-memory-server` in RAM or connect to cloud MongoDB Atlas with zero configuration changes."*

---

### Question 3: How is authentication and Role-Based Access Control (RBAC) implemented securely?
**Model Answer:**  
> *"Authentication is implemented using stateless JSON Web Tokens (JWT) and `bcryptjs` for password hashing with 10 salt rounds.
> 1. When a user registers or logs in, the backend validates credentials, signs a JWT containing the user's ID and role with a server-side `JWT_SECRET`, and sets a 7-day expiration.
> 2. On the frontend, an Axios request interceptor attaches the token as `Authorization: Bearer <token>`.
> 3. On protected routes, the `protect` middleware verifies the cryptographic signature and decodes the token, while the `authorize('doctor', 'admin')` middleware verifies whether `req.user.role` matches the route's allowed roles, returning `403 Forbidden` if unauthorized."*

---

### Question 4: How does CareSync prevent Insecure Direct Object References (IDOR) in medical document downloads?
**Model Answer:**  
> *"IDOR occurs when an application exposes a direct reference to an internal resource (such as `/api/records/:id/download`) without validating user authorization.
>
> In `recordController.downloadRecord`, before streaming the file:
> 1. We fetch the document's metadata and extract its `patient` ObjectId.
> 2. We check if `req.user.id == record.patient`. If yes, download is approved.
> 3. If a doctor requests the file, we execute a database lookup in the `Consent` collection:
>    ```javascript
>    const consent = await Consent.findOne({
>      patient: record.patient,
>      doctor: req.user.id,
>      status: 'active'
>    });
>    ```
>    If no active consent exists or `consent.permissions.shareMedicalRecords` is false, access is strictly blocked with a `403 Forbidden` response."*

---

### Question 5: How does the Consent Management mechanism enforce data privacy?
**Model Answer:**  
> *"CareSync implements a sovereign consent ledger inspired by the FHIR (Fast Healthcare Interoperability Resources) Consent specification.
> Rather than granting sweeping global access, patients have a granular permission object:
> `{ shareVitals: Boolean, shareMedications: Boolean, shareSymptoms: Boolean, shareMedicalRecords: Boolean }`.
> In `doctorController.getPatientDetails`, each subsystem is wrapped in a permission check: if `shareMedicalRecords` is false, the records array is omitted entirely from the response payload. Furthermore, patients can revoke consent with one click, which updates `status: 'revoked'` and timestamps `revokedAt`, immediately closing the doctor's access window."*

---

### Question 6: What is the Wellness Score formula, and why is it labeled 'non-diagnostic'?
**Model Answer:**  
> *"The Wellness Score is a composite rating on a scale from 0 to 100 designed to encourage positive daily health habits. It evaluates 6 weighted factors:
> - Sleep consistency (20 points for 7–9 hours)
> - Resting heart rate stability (20 points for 60–78 bpm)
> - Blood pressure stability (20 points for optimal systolic/diastolic bounds)
> - Medication adherence percentage (20 points for $\ge 90\%$ compliance)
> - Symptom burden (10 points deduction based on max severity)
> - Oxygen saturation stability (10 points for $\ge 96\%$ SpO2)
>
> **Why non-diagnostic?** In clinical informatics and healthcare software regulations (such as FDA Software as a Medical Device guidelines), software that claims to diagnose disease requires clinical trials and Class II medical device certification. By explicitly classifying this as a non-diagnostic lifestyle wellness index and displaying clear disclaimers, the platform remains legally sound, safe, and ethically responsible."*

---

### Question 7: How does your AI Health Briefing Assistant work without requiring an expensive paid API key?
**Model Answer:**  
> *"We implemented a dual-engine architecture in `AISummaryService`:
> 1. **Rule-Based Clinical NLP Engine (Default):** A deterministic Natural Language Generation (NLG) engine that evaluates the patient's 14-day metrics, calculates exact compliance rates, identifies symptom clusters, and formats an executive summary with 4 focused questions for the patient's next doctor visit. This runs 100% locally with zero latency, zero cost, and zero external failure points.
> 2. **LLM Connector (Optional):** If a `GEMINI_API_KEY` is supplied in the `.env` configuration, the system can dynamically route the anonymized metrics into Google's Gemini 1.5 Flash API for natural language synthesis, with automatic fallback to the rule-based engine if the API request times out."*

---

### Question 8: How do you handle emergency thresholds? What happens if a patient logs a critically high vital?
**Model Answer:**  
> *"Whenever a vital entry is posted via `/api/health-metrics`, the request immediately invokes `EmergencyDetectionService.evaluateVitals()`.
> It checks acute physiological red flags:
> - Systolic BP $\ge 180$ or Diastolic BP $\ge 120$ (Hypertensive Crisis range)
> - SpO2 $\le 88\%$ (Severe Hypoxemia)
> - Heart Rate $> 160$ or $< 40$ bpm (Critical arrhythmia)
> - Blood Glucose $< 50$ or $> 400$ mg/dL
>
> If triggered, the backend automatically generates a `critical` severity `Alert` record and returns an `emergencyNotice` payload. The frontend instantly mounts an animated `EmergencyBanner` alerting the user to seek immediate professional clinical attention or call local emergency dispatch (911 / 112 / 108)."*

---

### Question 9: How did you test your system to verify code reliability?
**Model Answer:**  
> *"We engineered a zero-dependency automated test runner in `backend/tests/runTests.js` covering three foundational test suites:
> 1. **Authentication & Cryptography (`api.test.js`):** Tests bcrypt salt generation, password hashing verification, rejection of incorrect passwords, JWT token signing, payload decoding, and rejection of tampered tokens.
> 2. **Wellness Score Math (`wellnessScore.test.js`):** Tests scoring boundary conditions (ideal profile = 100, elevated burden < 60).
> 3. **Trend Intelligence Logic (`trendIntelligence.test.js`):** Feeds controlled chronological data to confirm that a simulated +18% systolic rise and a +24% heart rate rise trigger positive delta flags.
> Running `npm test` executes the entire suite in under 300 milliseconds."*

---

### Question 10: What are the advantages and future scope of this platform?
**Model Answer:**  
> *"**Key Advantages:**
> - Shifting patient care from reactive emergency intervention to early preventive awareness.
> - Sovereign privacy protection through granular consent ledgers.
> - Transparent, explainable algorithmic reasoning that doctors and patients can understand.
> - High portability: runs as a standalone demo on a laptop or deploys into cloud infrastructure (Render, Vercel, MongoDB Atlas).
>
> **Future Scope:**
> 1. **Wearable IoT Device Integration:** Ingesting real-time telemetry from Apple HealthKit, Google Health Connect, or smart Bluetooth blood pressure cuffs via Web Bluetooth API.
> 2. **HL7 / FHIR Standard Compliance:** Exporting patient summaries into electronic health records (EHRs) like Epic or Cerner using standardized FHIR JSON resources.
> 3. **Encrypted Telehealth Video Consultations:** Integrating WebRTC video consultations directly inside the consented Doctor-Patient portal."*

