exports.aggregateMissingAndAlerts = (identity, education, finance, placement) => {
  const missing = [
    ...identity.missing,
    ...education.missing,
    ...finance.missing,
    ...placement.missing
  ];

  const alerts = [
    ...placement.alerts
  ];

  return { missing, alerts };
};
