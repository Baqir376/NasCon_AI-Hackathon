import os
import wave
import contextlib
import subprocess

def create_master_soundtrack():
    stems_dir = os.path.abspath("scripts/narration_stems")
    stems = [
        "scene_01_intro.wav",
        "scene_02_architecture.wav",
        "scene_03_onboarding_theme.wav",
        "scene_04_vitrine_bezier_blueprint.wav",
        "scene_05_grounding_learning_reader.wav",
        "scene_06_email_pdf_concierge_wrapup.wav"
    ]

    # Generate a concat list for ffmpeg with silence pads
    concat_list_file = os.path.join(stems_dir, "concat_list.txt")
    with open(concat_list_file, "w") as f:
        for s in stems:
            stem_path = os.path.join(stems_dir, s).replace("\\", "/")
            f.write(f"file '{stem_path}'\n")

    concatenated_voice = os.path.join(stems_dir, "voice_concatenated.wav")
    
    # Concatenate using ffmpeg
    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_file,
        "-c", "copy",
        concatenated_voice
    ]
    subprocess.run(cmd_concat, check=True)

    # Get duration of concatenated voice
    with contextlib.closing(wave.open(concatenated_voice, 'r')) as f:
        duration = f.getnframes() / float(f.getframerate())
        print(f"Concatenated voice duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")

    master_audio = os.path.abspath("scripts/narration_stems/walkthrough_master_soundtrack.wav")

    # Generate a subtle 528Hz Solfeggio harmonic ambient drone under the voice using ffmpeg synth filter
    # Voice at 1.0 volume, ambient bed at 0.04 volume with gentle fade in/out
    cmd_mix = [
        "ffmpeg", "-y",
        "-i", concatenated_voice,
        "-f", "lavfi", "-i", f"sine=frequency=264:duration={duration+2}",
        "-f", "lavfi", "-i", f"sine=frequency=528:duration={duration+2}",
        "-filter_complex",
        "[1:a]volume=0.03[bed1]; [2:a]volume=0.02[bed2]; [bed1][bed2]amix=inputs=2[bed]; [0:a]volume=1.0[voice]; [voice][bed]amix=inputs=2:duration=first:dropout_transition=2[out]",
        "-map", "[out]",
        "-c:a", "pcm_s16le",
        master_audio
    ]
    subprocess.run(cmd_mix, check=True)
    print(f"Master soundtrack created at {master_audio}, size: {os.path.getsize(master_audio)} bytes")
    return master_audio, duration

if __name__ == "__main__":
    create_master_soundtrack()
