function hashString(str) {
  return require("crypto").createHash("sha256").update(str).digest("hex");
}

module.exports = { hashString };
