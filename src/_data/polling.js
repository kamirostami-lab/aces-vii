module.exports = async function() {
  return {
    south_australia: {
      labor_tpp: 66,
      liberal_tpp: 34,
      labor_primary: 47,
      liberal_primary: 21,
      greens_primary: 13,
      sample_size: 1006,
      margin_of_error: 3.9,
      fieldwork_start: "October 2025",
      last_updated: new Date().toISOString().split("T")[0]
    },
    _fallback: true
  };
};
