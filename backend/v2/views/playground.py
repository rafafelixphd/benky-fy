# views/playground.py
from flask import Blueprint, render_template_string

router = Blueprint("playground", __name__)

HTML = """
<div style="font-family: sans-serif; max-width: 700px; margin: 40px auto;">
  <h2>Benky-Fy API Playground</h2>

  <form onsubmit="send(event)" style="display: flex; flex-direction: column; gap: 10px;">

    <label>URL</label>
    <input id="url" value="/v2/users/1" style="padding: 6px;" />

    <label>Method</label>
    <select id="method" style="padding: 6px;">
      <option>GET</option>
      <option>POST</option>
      <option>PUT</option>
      <option>DELETE</option>
    </select>

    <label>Body (JSON)</label>
    <textarea id="body" placeholder='{"key": "value"}' rows="6" style="padding: 6px;"></textarea>

    <button type="submit" style="padding: 8px 12px; cursor: pointer;">Send Request</button>

    <label>Response</label>
    <pre id="out" style="background:#f3f3f3; padding: 10px; border-radius: 4px;"></pre>
  </form>
</div>

<script>
async function send(e){
  e.preventDefault();

  const url = document.getElementById('url').value;
  const method = document.getElementById('method').value;
  const bodyText = document.getElementById('body').value.trim();

  let body = undefined;
  if(bodyText !== ""){
    try {
      body = JSON.stringify(JSON.parse(bodyText)); // validate JSON
    } catch(e) {
      document.getElementById('out').textContent = "Invalid JSON";
      return;
    }
  }

  const res = await fetch(url, {
    method,
    headers: {'Content-Type':'application/json'},
    body,
  });

  let text = "";
  try {
    text = JSON.stringify(await res.json(), null, 2);
  } catch {
    text = await res.text();
  }

  document.getElementById('out').textContent = text;
}
</script>
"""


@router.route("/playground")
def playground():
    return render_template_string(HTML)
