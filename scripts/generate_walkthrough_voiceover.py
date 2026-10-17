import win32com.client
import os
import wave
import contextlib

def generate_narration():
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    stream = win32com.client.Dispatch("SAPI.SpFileStream")

    output_dir = os.path.abspath("scripts/narration_stems")
    os.makedirs(output_dir, exist_ok=True)

    # Select David or natural desktop voice
    for v in speaker.GetVoices():
        name = v.GetDescription()
        print("Detected Voice:", name)
        if "David" in name or "Mark" in name:
            speaker.Voice = v

    speaker.Rate = -1 # Natural deliberate pacing for clear presentation

    scenes = [
        ("scene_01_intro.wav", 
         "Welcome judges to The Personal Morning Paper. Built for the NaSCon 26 AI Hackathon, our product restores the trusted dignity of traditional morning broadsheet journalism, transformed into an autonomous, source-grounded newsroom. In an era where readers are overwhelmed by infinite feeds and dopamine loops, we deliver a finite, verified daily briefing tailored to the reader's professional workflow."),

        ("scene_02_architecture.wav",
         "Let's look at our AI architecture and token optimization. Notice our live telemetry rail at the top right: we display real-time token counts, sub-millisecond generation latency, and estimated production costs—under two-tenths of a cent per paper. Our 9-stage architecture runs parallel multi-threaded RSS ingestion, caching articles by SHA-256 URL hash in SQLite so summaries are reused across readers. Crucially, if any news feed or the LLM fails, our deterministic in-process fallback guarantees the morning paper still arrives on time."),

        ("scene_03_onboarding_theme.wav",
         "Onboarding is completely frictionless. Using our pre-seeded judge personas—Alex Chen in AI Systems, Doctor Sarah Lin in Genomics, and Marcus Vance in Clean Energy—evaluators can switch perspectives with one click. Tapping Control K opens our Raycast-inspired command palette, providing instant keyboard-first navigation, and enabling seamless switching between our default Porcelain Alabaster and bespoke Red and Charcoal dark themes."),

        ("scene_04_vitrine_bezier_blueprint.wav",
         "Every domain has an architectural soul. Here in our 360-degree kinetic orbital vitrine, the broadsheet is rendered in 3D perspective space, rotatable across cardinal angles. Directly below, our living mathematical simulator computes cubic Bézier splines in real time, visualizing editorial momentum. Further down, our interactive architectural blueprint lets operators trace every pipeline stage, from deduplication to verified evidence anchoring."),

        ("scene_05_grounding_learning_reader.wav",
         "Let's examine the reading experience. Every story is strictly grounded: our synthesizer requires that factual claims are anchored by a verbatim primary source quote with direct publisher attribution. Readers can click 'Relevant' or 'Skip Topic' to dynamically adjust their topic weights in SQLite for their next edition. To eliminate algorithmic echo chambers, our 'Horizon' section reserves space for lateral discoveries. Clicking any story opens our tactile broadsheet reading room, complete with column layouts and drop caps."),

        ("scene_06_email_pdf_concierge_wrapup.wav",
         "Finally, our morning edition can be exported as a print-grade broadsheet PDF with 100 percent web-to-print data parity, or dispatched live through our email courier with verified SMTP transmission and instant webmail previews. And for on-the-go readers, our floating neural voice concierge provides voice briefings and answers questions with conversational context. With 29 passing automated tests and complete OWASP security hardening, The Personal Morning Paper restores clarity to daily news. Thank you!")
    ]

    stem_paths = []
    total_duration = 0.0

    for filename, text in scenes:
        stem_path = os.path.join(output_dir, filename)
        if os.path.exists(stem_path):
            os.remove(stem_path)
            
        stream.Open(stem_path, 3) # SSFMCreateForWrite
        speaker.AudioOutputStream = stream
        speaker.Speak(text)
        stream.Close()

        with contextlib.closing(wave.open(stem_path, 'r')) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            duration = frames / float(rate)
            total_duration += duration
            print(f"Generated {filename}: {duration:.2f} seconds ({os.path.getsize(stem_path)} bytes)")

        stem_paths.append((stem_path, duration))

    print(f"\nTotal Narration Duration: {total_duration:.2f} seconds ({total_duration/60:.2f} minutes)")
    return stem_paths, total_duration

if __name__ == "__main__":
    generate_narration()
