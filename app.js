const PAY_URL = "";
const letterKey = "zaichang-letters";
const memberKey = "zaichang-members";

const menu = document.getElementById("menu");
const links = document.getElementById("links");
menu.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menu.setAttribute("aria-expanded", open ? "true" : "false");
});
links.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    links.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

document.getElementById("letter").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const email = String(data.get("email") || "").trim();
  const list = readList(letterKey);
  list.push({ email, at: new Date().toISOString() });
  saveList(letterKey, list);
  const note = document.getElementById("letter-note");
  note.textContent = "已记下。公开信会发到这个邮箱。这台浏览器里现在有 " + list.length + " 位读者。";
  event.currentTarget.reset();
});

document.getElementById("member").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const entry = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    wechat: String(data.get("wechat") || "").trim(),
    plan: data.get("plan") === "yearly" ? "年付 ¥648" : "月付 ¥68",
    at: new Date().toISOString()
  };
  const list = readList(memberKey);
  list.push(entry);
  saveList(memberKey, list);
  const help = document.getElementById("pay-help");
  help.hidden = false;
  document.getElementById("pay-copy").textContent =
    entry.name + "，" + entry.plan + "。确认信发到 " + entry.email + "。支付链接还是占位，换成你的收款地址后，这位会员就可以付款。";
  document.getElementById("member-note").textContent = "第 " + list.length + " 位。名单可下载。";
  const payLink = document.getElementById("pay-link");
  if (PAY_URL) {
    payLink.href = PAY_URL;
    payLink.textContent = "去支付";
  } else {
    payLink.href = "#pay-help";
    payLink.textContent = "收款链接还没填";
  }
  help.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("export").addEventListener("click", () => {
  const members = readList(memberKey);
  const letters = readList(letterKey);
  const lines = ["type,name,email,wechat,plan,at"];
  letters.forEach((item) => lines.push(["letter", "", item.email, "", "", item.at].map(csv).join(",")));
  members.forEach((item) => lines.push(["member", item.name, item.email, item.wechat, item.plan, item.at].map(csv).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zaichang-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
});

function csv(value) {
  return '"' + String(value == null ? "" : value).replaceAll('"', '""') + '"';
}
