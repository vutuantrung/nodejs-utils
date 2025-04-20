import os
import time
import json
import re
import requests
import asyncio
from datetime import datetime
from io import StringIO
from progress.bar import Bar

CONFIG = {
    "inputFilePath": "/content/youtubeDownloadUrls.txt",
    "logFilePath": "/content/youtubeDownloadCombined.log",
    "saveFolder": "/content/savefiles"
}

RETRY_MAX = 3
TAG = "[VIDEO_TASK]"

def sanitize(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)

def append_text_to_file(text, file_path):
    try:
        with open(file_path, 'a', encoding='utf-8') as f:
            f.write(text)
        print('Data appended to file!')
    except Exception as e:
        raise RuntimeError(f'Failed to append to file: {e}')

def read_lines(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.readlines()

def fetch_video_data(video_url):
    url = "https://www.clipto.com/api/youtube"
    headers = { "Content-Type": "application/json" }
    body = { "url": video_url }
    r = requests.post(url, json=body, headers=headers)
    return r.json()

def download_video(url, output_path='video.mp4'):
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_length = int(r.headers.get('Content-Length', 0))
            print(f"\U0001F4E6 File size: {total_length / (1024 * 1024):.2f} MB")
            bar = Bar('\U0001F4E5 Downloading', max=total_length, suffix='%(percent)d%% - %(eta)ds')
            with open(output_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        bar.next(len(chunk))
            bar.finish()
            print(f"✅ Download completed: {output_path}")
    except Exception as e:
        print(f"❌ Download failed: {str(e)}")

async def download_videos_by_url():
    urls = [
        next((part for part in line.strip().split() if part.startswith("http")), None)
        for line in read_lines(CONFIG["inputFilePath"])
    ]
    urls = list(filter(None, urls))

    if not urls:
        print(TAG, 'No URLs found.')
        return

    success_count = 0
    failed_count = 0
    existing_success = ''
    if os.path.exists(CONFIG["logFilePath"]):
        with open(CONFIG["logFilePath"], 'r', encoding='utf-8') as f:
            existing_success = f.read()

    for url in urls:
        print("Video URL:", url)

        if url in existing_success:
            print(TAG, "Video is already downloaded:", url)
            success_count += 1
            print("\n\n")
            continue

        print("[TASK] Check video hasn't been downloaded => Fetch video information")

        retrieved_data = None
        for retry in range(RETRY_MAX):
            data = fetch_video_data(url)
            if data.get("success"):
                retrieved_data = data
                break
            print(TAG, f"Retrying {retry + 1} time... (3s)", data.get("error") or data.get("message"))
            time.sleep(3)

        if not retrieved_data:
            print(TAG, "Error fetching video data:", url)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            append_text_to_file(f"[{timestamp}] [FAILED_LOG] [FETCHING] {url}\n", CONFIG["logFilePath"])
            failed_count += 1
            print("\n\n")
            continue

        medias = [m for m in retrieved_data["medias"] if m["type"] == "video"]
        print("[TASK] Fetch video success => Finding best quality from:",
              ", ".join(m["quality"] for m in medias))

        def pick(quality, ext):
            return next((m for m in medias if m["quality"] == quality and m["extension"] == ext), None)

        best_video = (
            pick('4320p', 'mp4') or pick('mp4 (4320p)', 'mp4') or
            pick('2160p', 'webm') or pick('webm (2160p)', 'webm') or
            pick('2160p60', 'webm') or pick('webm (2160p60)', 'webm') or
            pick('1440p', 'webm') or pick('webm (1440p)', 'webm') or
            pick('1440p60', 'webm') or pick('webm (1440p60)', 'webm') or
            pick('1080p', 'webm') or pick('webm (1080p)', 'webm') or
            pick('1080p60', 'webm') or pick('webm (1080p60)', 'webm') or
            pick('1080p', 'mp4') or pick('mp4 (1080p)', 'mp4') or
            pick('1080p60', 'mp4') or pick('mp4 (1080p60)', 'mp4')
        )

        if not best_video:
            print(TAG, 'Error getting best video:', url)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            append_text_to_file(f"[{timestamp}] [FAILED_LOG] [FILTERING] {url}\n", CONFIG["logFilePath"])
            failed_count += 1
            print("\n\n")
            continue

        print(f"[TASK] Best video found: {best_video['quality']} => Downloading...")

        os.makedirs(CONFIG["saveFolder"], exist_ok=True)
        video_ext = best_video.get("extension") or best_video.get("ext")
        video_title = retrieved_data["title"]
        video_name = sanitize(f"{video_title}.{video_ext}")
        video_path = os.path.join(CONFIG["saveFolder"], video_name)

        if os.path.exists(video_path):
            print(TAG, "Video is already downloaded:", url)
            append_text_to_file(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [SUCCESS_LOG] {url}\n", CONFIG["logFilePath"])
            success_count += 1
            print("\n\n")
            continue

        try:
            download_video(best_video["url"], video_path)
            print(TAG, "Download successful:", url)
            append_text_to_file(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [SUCCESS_LOG] {url}\n", CONFIG["logFilePath"])
            success_count += 1
        except Exception as e:
            print(TAG, "Error downloading video:", url, str(e))
            append_text_to_file(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [FAILED_LOG] [DOWNLOAD] {url}\n", CONFIG["logFilePath"])
            failed_count += 1

        print("\n\n")

    print(TAG, "All URLs processed. Success:", success_count, "Failed:", failed_count)

async def upload_videos_in_groups():
    client = TelegramClient(StringSession(STRING_SESSION), API_ID, API_HASH)
    await client.start()
    print("✅ Connected to Telegram")

    try:
        channel = await client.get_entity(CHANNEL_USERNAME)
        video_files = sorted([
            f for f in VIDEO_DIR.iterdir()
            if f.suffix.lower() in ['.mp4', '.webm']
        ])

        if not video_files:
            print("📭 No video files found in:", VIDEO_DIR)
            return

        # Split into batches of 10
        batch_size = 10
        total_batches = ceil(len(video_files) / batch_size)

        for b in range(total_batches):
            batch = video_files[b * batch_size:(b + 1) * batch_size]
            media_group = []

            print(f"📦 Sending batch {b + 1}/{total_batches} with {len(batch)} videos...")

            for file_path in batch:
                try:
                    uploaded = await client.upload_file(str(file_path))
                    media = InputMediaUploadedDocument(
                        file=uploaded,
                        mime_type='video/mp4',
                        attributes=[DocumentAttributeVideo(supports_streaming=True)],
                    )
                    media_group.append({
                        "media": media,
                        "message": file_path.name
                    })
                except Exception as e:
                    log_result(FAILED_LOG, f"{file_path.name} - Upload error: {str(e)}")
                    print(f"❌ Failed: {file_path.name} - {str(e)}")

            if media_group:
                await client(SendMultiMedia(
                    peer=channel,
                    multi_media=media_group
                ))
                for item in media_group:
                    log_result(SUCCESS_LOG, f"{item['message']} - Uploaded in batch")
                    print(f"✅ Uploaded: {item['message']}")

    finally:
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(download_videos_by_url())
