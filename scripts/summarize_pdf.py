import os
import PyPDF2
from anthropic import Anthropic

# ========== 配置 ==========
API_KEY = os.environ.get("ANTHROPIC_API_KEY")  # 建议用环境变量存 Key
PDF_PATH = "files/Aobo_CV.pdf"
OUTPUT_PATH = "cv_summary.md"

# ========== 读 PDF ==========
def read_pdf(path, max_chars=6000):
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        texts = []
        for page in reader.pages:
            t = page.extract_text() or ""
            texts.append(t)
            if sum(len(x) for x in texts) > max_chars:
                break
        return "\n".join(texts)[:max_chars]

# ========== 调 Claude ==========
def summarize_with_claude(text):
    client = Anthropic(api_key=API_KEY)
    resp = client.messages.create(
        model="claude-3-7-sonnet-2025-06-20",
        max_tokens=800,
        messages=[
            {
                "role": "user",
                "content": f"这是我的简历文本：\n{text}\n\n请帮我生成一个简明的学术简介。"
            }
        ]
    )
    # Claude 的输出在 resp.content 里
    return "".join(block.text for block in resp.content if hasattr(block, "text"))

# ========== 主流程 ==========
if __name__ == "__main__":
    if not API_KEY:
        raise RuntimeError("请先设置环境变量 ANTHROPIC_API_KEY")

    print("读取 PDF...")
    pdf_text = read_pdf(PDF_PATH)

    print("调用 Claude API，总结简历...")
    summary = summarize_with_claude(pdf_text)

    print("写入结果到", OUTPUT_PATH)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("# CV Summary\n\n")
        f.write(summary)

    print("✅ 完成！总结已保存到 cv_summary.md")
