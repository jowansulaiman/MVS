function generateUniqueId() {
  return `mieter_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

module.exports = generateUniqueId;
