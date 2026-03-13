import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./HistoricalTrendsModal.css";

const DAY_WINDOW = 7;
const MONTH_WINDOW = 6;
const YEAR_WINDOW = 5;

function HistoricalTrendsModal({
  isOpen,
  onClose,
  sensor,
  nodeLabel = "USLS",
  events = [],
  selectId = "historical-trend-view-select",
}) {
  const [viewMode, setViewMode] = useState("day");

  useEffect(() => {
    if (isOpen) {
      setViewMode("day");
    }
  }, [isOpen]);

  const trendsSeries = useMemo(() => {
    const now = new Date(sensor?.timestamp || new Date().toISOString());
    const labels = [];
    const buckets = {};

    if (viewMode === "day") {
      for (let index = DAY_WINDOW - 1; index >= 0; index -= 1) {
        const date = new Date(now);
        date.setDate(now.getDate() - index);
        const key = date.toISOString().split("T")[0];
        labels.push(date.toLocaleDateString(undefined, { weekday: "short" }));
        buckets[key] = { clog: 0, overflow: 0 };
      }
    } else if (viewMode === "month") {
      for (let index = MONTH_WINDOW - 1; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        labels.push(
          date.toLocaleDateString(undefined, {
            month: "short",
            year: "2-digit",
          }),
        );
        buckets[key] = { clog: 0, overflow: 0 };
      }
    } else if (viewMode === "year") {
      for (let index = YEAR_WINDOW - 1; index >= 0; index -= 1) {
        const year = now.getFullYear() - index;
        const key = String(year);
        labels.push(key);
        buckets[key] = { clog: 0, overflow: 0 };
      }
    } else {
      const sortedEvents = [...events].sort(
        (firstEvent, secondEvent) =>
          new Date(firstEvent.date) - new Date(secondEvent.date),
      );

      const firstEventDate = sortedEvents.length
        ? new Date(sortedEvents[0].date)
        : new Date(now);
      const startDate = new Date(
        firstEventDate.getFullYear(),
        firstEventDate.getMonth(),
        1,
      );
      const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
        labels.push(
          cursor.toLocaleDateString(undefined, {
            month: "short",
            year: "2-digit",
          }),
        );
        buckets[key] = { clog: 0, overflow: 0 };
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    events.forEach((eventItem) => {
      const eventDate = new Date(eventItem.date);
      const bucketKey =
        viewMode === "day"
          ? eventDate.toISOString().split("T")[0]
          : viewMode === "year"
            ? String(eventDate.getFullYear())
            : `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}`;

      if (buckets[bucketKey]) {
        buckets[bucketKey][eventItem.type] += 1;
      }
    });

    const orderedKeys = Object.keys(buckets);
    const clogs = orderedKeys.map((key) => buckets[key].clog);
    const overflows = orderedKeys.map((key) => buckets[key].overflow);

    return { labels, clogs, overflows };
  }, [events, sensor?.timestamp, viewMode]);

  const totalClogs = trendsSeries.clogs.reduce((sum, count) => sum + count, 0);
  const totalOverflows = trendsSeries.overflows.reduce(
    (sum, count) => sum + count,
    0,
  );
  const peakFrequency = Math.max(
    ...trendsSeries.clogs,
    ...trendsSeries.overflows,
    1,
  );

  const viewModeLabel =
    viewMode === "day"
      ? "Last 7 Days"
      : viewMode === "month"
        ? "Last 6 Months"
        : viewMode === "year"
          ? "Last 5 Years"
          : "Since Launch";

  const chartWidth = 900;
  const chartHeight = 340;
  const margin = { top: 20, right: 20, bottom: 58, left: 52 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const groupCount = trendsSeries.labels.length || 1;
  const groupWidth = plotWidth / groupCount;
  const barGap = 5;
  const barWidth = Math.max(6, Math.min(18, (groupWidth - barGap - 8) / 2));

  const buildYTickValues = (maxValue) => {
    if (maxValue <= 8) {
      return Array.from({ length: maxValue + 1 }, (_, index) => index);
    }

    const targetSegments = 5;
    const step = Math.ceil(maxValue / targetSegments);
    const values = [];

    for (let value = 0; value <= maxValue; value += step) {
      values.push(value);
    }

    if (values[values.length - 1] !== maxValue) {
      values.push(maxValue);
    }

    return values;
  };

  const yTickValues = buildYTickValues(peakFrequency);
  const yTicks = yTickValues.map((value, index) => {
    const y = margin.top + plotHeight - (value / peakFrequency) * plotHeight;
    return { id: index, value, y };
  });
  const visibleYTicks =
    viewMode === "day" ? yTicks : yTicks.filter((tick) => tick.value !== 1);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="historical-trends-modal-overlay" onClick={onClose}>
      <div
        className="historical-trends-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="historical-trends-modal-header">
          <h2>Historical Trends</h2>
          <button className="historical-trends-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="historical-trends-modal-body">
          <div className="historical-trends-summary-cards">
            <div className="historical-trends-summary-card">
              <span className="historical-trends-label">Node</span>
              <span className="historical-trends-value">{nodeLabel}</span>
            </div>
            <div className="historical-trends-summary-card">
              <span className="historical-trends-label">Time Window</span>
              <span className="historical-trends-value">{viewModeLabel}</span>
            </div>
            <div className="historical-trends-summary-card">
              <span className="historical-trends-label">Clog Incidents</span>
              <span className="historical-trends-value">{totalClogs}</span>
            </div>
            <div className="historical-trends-summary-card">
              <span className="historical-trends-label">
                Overflow Incidents
              </span>
              <span className="historical-trends-value">{totalOverflows}</span>
            </div>
          </div>

          <div className="historical-trends-toolbar">
            <p className="historical-trends-description">
              Frequency of clog and overflow incidents for proactive monitoring
              and planning.
            </p>
            <div className="historical-trends-view-switch">
              <label
                htmlFor={selectId}
                className="historical-trends-view-label"
              >
                View
              </label>
              <select
                id={selectId}
                className="historical-trends-view-select"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value)}
              >
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="sinceLaunch">Since Launch</option>
              </select>
            </div>
          </div>

          <div className="historical-trends-chart-wrapper">
            <div className="historical-trends-legend">
              <span className="historical-trends-legend-item">
                <span className="historical-trends-legend-dot clog" /> Clogs
              </span>
              <span className="historical-trends-legend-item">
                <span className="historical-trends-legend-dot overflow" />
                Overflows
              </span>
            </div>

            <svg
              className="historical-trends-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Historical grouped bar chart for clogs and overflows"
            >
              {visibleYTicks.map((tick) => (
                <g key={`grid-${tick.id}`}>
                  <line
                    x1={margin.left}
                    y1={tick.y}
                    x2={chartWidth - margin.right}
                    y2={tick.y}
                    className="historical-trends-grid-line"
                  />
                  <text
                    x={margin.left - 10}
                    y={tick.y + 4}
                    className="historical-trends-y-label"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + plotHeight}
                className="historical-trends-axis-line"
              />
              <line
                x1={margin.left}
                y1={margin.top + plotHeight}
                x2={chartWidth - margin.right}
                y2={margin.top + plotHeight}
                className="historical-trends-axis-line"
              />

              {trendsSeries.labels.map((label, index) => {
                const groupStartX = margin.left + index * groupWidth;
                const clogValue = trendsSeries.clogs[index];
                const overflowValue = trendsSeries.overflows[index];
                const clogHeight = (clogValue / peakFrequency) * plotHeight;
                const overflowHeight =
                  (overflowValue / peakFrequency) * plotHeight;
                const barGroupWidth = barWidth * 2 + barGap;
                const offset = (groupWidth - barGroupWidth) / 2;
                const showLabel =
                  trendsSeries.labels.length <= 12 ||
                  index % Math.ceil(trendsSeries.labels.length / 12) === 0 ||
                  index === trendsSeries.labels.length - 1;

                return (
                  <g key={`bar-${label}-${index}`}>
                    <rect
                      x={groupStartX + offset}
                      y={margin.top + plotHeight - clogHeight}
                      width={barWidth}
                      height={clogHeight}
                      className="historical-trends-bar clog-bar"
                      rx="3"
                    />
                    <rect
                      x={groupStartX + offset + barWidth + barGap}
                      y={margin.top + plotHeight - overflowHeight}
                      width={barWidth}
                      height={overflowHeight}
                      className="historical-trends-bar overflow-bar"
                      rx="3"
                    />

                    {showLabel && (
                      <text
                        x={groupStartX + groupWidth / 2}
                        y={margin.top + plotHeight + 22}
                        textAnchor="middle"
                        className="historical-trends-x-label"
                      >
                        {label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoricalTrendsModal;
