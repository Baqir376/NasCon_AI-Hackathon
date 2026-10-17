import win32com.client
import os

speaker = win32com.client.Dispatch("SAPI.SpVoice")
stream = win32com.client.Dispatch("SAPI.SpFileStream")

output_path = os.path.abspath("scripts/voiceover.wav")
stream.Open(output_path, 3) # 3 = SSFMCreateForWrite
speaker.AudioOutputStream = stream

# Find natural voice if available (e.g. David, Zira, Mark)
for v in speaker.GetVoices():
    name = v.GetDescription()
    print("Available Voice:", name)
    if "David" in name or "Mark" in name or "Zira" in name:
        speaker.Voice = v

speaker.Rate = 0 # Natural conversational pace
text = "Ink becomes type. Type becomes data. Data becomes architecture. The Morning Paper. Autonomous newsroom intelligence, engineered with architectural precision."
speaker.Speak(text)
stream.Close()
print(f"Generated voiceover at {output_path}, file size: {os.path.getsize(output_path)} bytes")
