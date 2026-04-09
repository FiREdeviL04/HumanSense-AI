const labels = ["happy", "sad", "angry", "stressed", "neutral"];

export function summarizeSession({ emotionHistory = [], behaviorHistory = [], latestIntent, latestAction, duration = 15 }) {
  const emotionCountMap = labels.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

  emotionHistory.forEach((item) => {
    const key = item?.label || "neutral";
    emotionCountMap[key] = (emotionCountMap[key] || 0) + 1;
  });

  const totalEmotionFrames = Math.max(1, emotionHistory.length);
  const emotionDistribution = Object.entries(emotionCountMap).map(([name, count]) => ({
    name,
    value: Number((count / totalEmotionFrames).toFixed(2)),
  }));

  const dominantEmotion = emotionDistribution.sort((a, b) => b.value - a.value)[0]?.name || "neutral";

  const avg = (arr, key) => {
    if (!arr.length) {
      return 0;
    }
    return arr.reduce((sum, item) => sum + (Number(item?.[key]) || 0), 0) / arr.length;
  };

  const meanVelocity = avg(behaviorHistory, "mouseVelocity");
  const meanScrollBurst = avg(behaviorHistory, "scrollBurstScore");
  const meanClickInterval = avg(behaviorHistory, "clickIntervalAvg");

  const confusion = Math.min(1, (meanVelocity * 0.35) + (meanClickInterval < 500 ? 0.45 : 0.12));
  const engagement = Math.max(0, Math.min(1, (1 - meanScrollBurst) * 0.45 + (meanVelocity < 1.4 ? 0.45 : 0.2)));
  const exitProbability = Math.min(1, meanScrollBurst * 0.65 + (meanClickInterval > 2000 ? 0.25 : 0.06));

  let recommendation = "Engagement looked stable. Continue with the current interface mode.";

  if (dominantEmotion === "stressed" || latestIntent === "confusion") {
    recommendation = "You seemed slightly stressed and confused. We recommend enabling guided mode.";
  } else if (latestIntent === "exit_intent") {
    recommendation = "Exit probability increased. Trigger a retention nudge or simplify the final steps.";
  } else if (dominantEmotion === "angry") {
    recommendation = "Frustration was detected. Reduce notifications and shorten decision paths.";
  }

  const observations = [
    `Dominant emotion was ${dominantEmotion}.`,
    `Confusion signal reached ${(confusion * 100).toFixed(0)}%.`,
    `Engagement averaged ${(engagement * 100).toFixed(0)}%.`,
    `Exit probability estimated at ${(exitProbability * 100).toFixed(0)}%.`,
    latestAction ? `Adaptive action suggested: ${latestAction}.` : "No adaptive action was necessary.",
  ];

  return {
    duration,
    dominantEmotion,
    emotionDistribution,
    behaviorScores: {
      confusion,
      engagement,
      exitProbability,
    },
    recommendation,
    observations,
  };
}
