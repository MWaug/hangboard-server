export const chartConfig = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Weight (lbs)",
        // backgroundColor: "rgba(224, 110, 60, 0)",
        borderColor: "rgb(224, 110, 60)",
        data: [{ x: 0, y: 0 }],
        fill: true,
        pointRadius: 0,
        lineTension: 0.1,
        borderJoinStyle: "round",
        font: {
          size: 24,
          style: "bold",
        },
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "My Title",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: {
        type: "linear",
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Time (s)",
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
          minRotation: 0,
          maxRotation: 0,
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: false,
        },
        ticks: {
          autoSkipPadding: 100,
          autoSkip: true,
        },
      },
    },
  },
};
