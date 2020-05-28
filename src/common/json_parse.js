function safeJsonParse(jsonData) {
  if (typeof jsonData !== 'string') {
    return jsonData;
  }
  let data = jsonData;
  try {
    data = JSON.parse(jsonData);
  } catch (err) {}
  return data;
}

module.exports = {
  safeJsonParse,
};
