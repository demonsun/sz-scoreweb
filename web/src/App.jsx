import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import districtData from "../../data/districts/index.js";
import scoreEngine from "../../utils/score-engine.js";
import probability from "../../utils/probability.js";

const PAGES = { HOME: "home", CALC: "calc", RESULT: "result", DETAIL: "detail" };

function App() {
  const districtList = districtData?.districtList || [];
  const [page, setPage] = useState(PAGES.HOME);
  const [districtKey, setDistrictKey] = useState("");
  const [stage, setStage] = useState("xiaoxue");
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  const goHome = useCallback(() => {
    setPage(PAGES.HOME);
    setDistrictKey("");
    setAnswers({});
    setCurrentStep(0);
    setScoreResult(null);
    setSelectedSchool(null);
  }, []);

  const startCalc = useCallback((key) => {
    setDistrictKey(key);
    setAnswers({});
    setCurrentStep(0);
    setScoreResult(null);
    setPage(PAGES.CALC);
  }, []);

  if (page === PAGES.HOME) {
    return <HomePage districts={districtList} stage={stage} setStage={setStage} onSelect={startCalc} />;
  }
  if (page === PAGES.CALC) {
    return (
      <CalcPage
        districtKey={districtKey}
        stage={stage}
        answers={answers}
        setAnswers={setAnswers}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onBack={goHome}
        onSubmit={(result) => { setScoreResult(result); setPage(PAGES.RESULT); }}
      />
    );
  }
  if (page === PAGES.RESULT) {
    return (
      <ResultPage
        districtKey={districtKey}
        stage={stage}
        answers={answers}
        result={scoreResult}
        onBack={() => setPage(PAGES.CALC)}
        onHome={goHome}
        onSchoolTap={(s) => { setSelectedSchool(s); setPage(PAGES.DETAIL); }}
      />
    );
  }
  if (page === PAGES.DETAIL) {
    return (
      <DetailPage
        school={selectedSchool}
        userScore={scoreResult?.totalScore}
        userCategory={scoreResult?.category}
        onBack={() => setPage(PAGES.RESULT)}
      />
    );
  }
  return null;
}

/* ─── Home Page ─── */
function HomePage({ districts, stage, setStage, onSelect }) {
  return (
    <div className="page page-home">
      <header className="hero">
        <h1>深圳积分入学助手</h1>
        <p>快速计算积分，评估目标学校录取概率</p>
      </header>

      <div className="stage-tabs">
        <button className={stage === "xiaoxue" ? "active" : ""} onClick={() => setStage("xiaoxue")}>幼升小</button>
        <button className={stage === "chuzhong" ? "active" : ""} onClick={() => setStage("chuzhong")}>小升初</button>
      </div>

      <div className="district-grid">
        {districts.map((d) => (
          <button key={d.key} className="district-card" style={{ "--accent": d.color || "#2563eb" }} onClick={() => onSelect(d.key)}>
            <span className="district-icon">{d.name.charAt(0)}</span>
            <span className="district-name">{d.name}</span>
            <span className="district-desc">{d.description}</span>
          </button>
        ))}
      </div>

      <footer className="home-footer">
        <p>数据基于2025年各区教育局公开政策，仅供参考</p>
      </footer>
    </div>
  );
}

/* ─── Calculator Page ─── */
function CalcPage({ districtKey, stage, answers, setAnswers, currentStep, setCurrentStep, onBack, onSubmit }) {
  const district = useMemo(() => districtData.getDistrict(districtKey), [districtKey]);
  const questions = useMemo(() => scoreEngine.getVisibleQuestions(districtKey, answers, stage), [districtKey, answers, stage]);
  const allAnswered = useMemo(() => scoreEngine.isAllQuestionsAnswered(districtKey, answers, stage), [districtKey, answers, stage]);
  const stageLabel = stage === "chuzhong" ? "小升初" : "幼升小";
  const progress = questions.length ? Math.round(((currentStep + 1) / questions.length) * 100) : 0;
  const currentQ = questions[currentStep];

  const handleAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const canNext = currentQ && answers[currentQ.id] !== undefined && answers[currentQ.id] !== "";
  const isLast = currentStep === questions.length - 1;

  const handleNext = () => {
    if (isLast && allAnswered) {
      const result = scoreEngine.calculateScore(districtKey, answers, stage);
      if (result) onSubmit(result);
    } else if (canNext && currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!district || !currentQ) return null;

  return (
    <div className="page page-calc">
      <nav className="nav-bar">
        <button className="nav-back" onClick={onBack}>← 返回</button>
        <span className="nav-title">{district.name} · {stageLabel}</span>
        <span className="nav-step">{currentStep + 1}/{questions.length}</span>
      </nav>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: progress + "%" }} />
      </div>

      <div className="card-container">
        <div className="q-card">
          <div className="q-number">Q{currentStep + 1}</div>
          <h2 className="q-title">{currentQ.title}</h2>
          {currentQ.subtitle && <p className="q-sub">{currentQ.subtitle}</p>}

          {currentQ.type === "single" ? (
            <div className="options-list">
              {(currentQ.options || []).map((opt) => (
                <button
                  key={opt.value}
                  className={"option-btn" + (answers[currentQ.id] === opt.value ? " selected" : "")}
                  onClick={() => handleAnswer(currentQ.id, opt.value)}
                >
                  <span className="option-radio" />
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min={currentQ.min ?? 0}
                max={currentQ.max ?? 9999}
                placeholder={currentQ.placeholder || "请输入数字"}
                value={answers[currentQ.id] ?? ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              />
              {currentQ.unit && <span className="input-unit">{currentQ.unit}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="calc-actions">
        <button className="btn-secondary" onClick={handlePrev} disabled={currentStep === 0}>上一步</button>
        <button className="btn-primary" onClick={handleNext} disabled={!canNext}>
          {isLast && allAnswered ? "查看结果" : "下一步"}
        </button>
      </div>
    </div>
  );
}

/* ─── Result Page ─── */
function ResultPage({ districtKey, stage, answers, result, onBack, onHome, onSchoolTap }) {
  const district = useMemo(() => districtData.getDistrict(districtKey), [districtKey]);
  const catPriority = !!district?.categoryPriority;

  const schoolList = useMemo(() => {
    const userArea = scoreEngine.getUserArea(answers);
    const all = scoreEngine.getSchools(districtKey, stage);
    const filtered = userArea === "all" ? all : all.filter((s) => !s.area || s.area === userArea);
    return probability.evaluateSchoolList(result.totalScore, result.category, filtered, catPriority);
  }, [districtKey, stage, answers, result, catPriority]);

  const maxScore = { futian: 100, luohu: 160, nanshan: 100, baoan: 120 }[districtKey] || 120;
  const pct = Math.min((result.totalScore / maxScore) * 100, 100);

  return (
    <div className="page page-result">
      <nav className="nav-bar">
        <button className="nav-back" onClick={onBack}>← 修改</button>
        <span className="nav-title">计算结果</span>
        <button className="nav-home" onClick={onHome}>首页</button>
      </nav>

      <div className="result-hero">
        <div className="score-ring" style={{ "--pct": pct }}>
          <span className="score-value">{result.totalScore}</span>
          <span className="score-label">总分</span>
        </div>
        <span className="category-badge" style={{ background: getCatColor(result.category) }}>{result.category}</span>
      </div>

      <div className="detail-card">
        <h3>积分明细</h3>
        {result.details.map((d) => (
          <div className="detail-row" key={d.label}>
            <span>{d.label}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>

      <div className="school-section">
        <h3>匹配学校（{schoolList.length} 所）</h3>
        {schoolList.map((s) => (
          <button className="school-card" key={s.name} onClick={() => onSchoolTap(s)}>
            <div className="school-top">
              <span className="school-name">{s.name}</span>
              <span className="prob-tag" style={{ background: s.probability.color }}>{s.probability.level} {s.probability.percent}</span>
            </div>
            <div className="school-bot">
              <span className="school-addr">{s.address}</span>
              <span className="school-score">
                {Object.keys(s.scores).sort().map((y) => (
                  <span key={y} className="year-score">{y}: {probability.formatScoreDisplay(s.scores[y])}</span>
                ))}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Detail Page ─── */
function DetailPage({ school, userScore, userCategory, onBack }) {
  const canvasRef = useRef(null);
  if (!school) return null;

  const scores = school.scores;
  const years = Object.keys(scores).sort();
  const scoreValues = years.map((y) => probability.getNumericScore(scores[y]));
  const latestYear = years[years.length - 1];
  const latestScore = probability.getNumericScore(scores[latestYear]);
  const diff = Math.round((userScore - latestScore) * 10) / 10;
  const avgScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length * 10) / 10;
  const trend = probability.getTrend(scores);
  const trendText = trend > 1 ? `持续上涨（年均+${(Math.round(trend * 10) / 10)}分）` : trend < -1 ? `持续下降（年均${(Math.round(trend * 10) / 10)}分）` : "基本持平";

  const suggestion = getSuggestion(school.probability.rank, diff, trend);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth;
    const h = el.clientHeight;
    el.width = w * dpr;
    el.height = h * dpr;
    ctx.scale(dpr, dpr);
    drawChart(ctx, w, h, years, scoreValues, userScore);
  }, [years, scoreValues, userScore]);

  return (
    <div className="page page-detail">
      <nav className="nav-bar">
        <button className="nav-back" onClick={onBack}>← 返回</button>
        <span className="nav-title">{school.name}</span>
        <span />
      </nav>

      <div className="detail-hero-row">
        <div className="stat-box">
          <span className="stat-val">{userScore}</span>
          <span className="stat-lbl">你的积分</span>
        </div>
        <div className="stat-box">
          <span className="stat-val" style={{ color: diff >= 0 ? "#34a853" : "#ea4335" }}>{diff >= 0 ? "+" : ""}{diff}</span>
          <span className="stat-lbl">与{latestYear}年录取线差</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{avgScore}</span>
          <span className="stat-lbl">近三年均分</span>
        </div>
      </div>

      <div className="detail-card">
        <h3>录取分数线趋势</h3>
        <canvas ref={canvasRef} className="trend-canvas" />
        <p className="trend-text">{trendText}</p>
      </div>

      <div className="detail-card">
        <h3>逐年对比</h3>
        {years.map((y) => {
          const s = probability.getNumericScore(scores[y]);
          const d = Math.round((userScore - s) * 10) / 10;
          return (
            <div className="year-row" key={y}>
              <span className="yr">{y}年</span>
              <span className="yr-score">{probability.formatScoreDisplay(scores[y])}</span>
              <span className={"yr-diff" + (d >= 0 ? " pos" : " neg")}>{d >= 0 ? "+" : ""}{d}</span>
            </div>
          );
        })}
      </div>

      <div className="detail-card suggestion-card">
        <h3>录取建议</h3>
        <p>{suggestion}</p>
      </div>
    </div>
  );
}

/* ─── helpers ─── */
function getCatColor(cat) {
  if (/A|第一/.test(cat)) return "#34a853";
  if (/B|第二/.test(cat)) return "#4285f4";
  if (/C|第三/.test(cat)) return "#f9ab00";
  if (/D|第四/.test(cat)) return "#ea4335";
  return "#6c757d";
}

function getSuggestion(rank, diff, trend) {
  const trendDir = trend > 1 ? "up" : trend < -1 ? "down" : "flat";
  if (rank <= 2) {
    return "您的积分较高，录取该校的可能性较大。" + (trendDir === "up" ? "但需注意该校录取分数线呈上涨趋势，建议持续关注最新政策变化，做好备选方案。" : "该校录取分数线较为稳定或有所下降，可以作为第一志愿重点考虑。");
  }
  if (rank === 3) return "您的积分与该校录取线接近，存在一定录取可能。建议：1）关注是否有其他加分项可以争取；2）准备1-2所分数线略低的备选学校；3）密切关注当年招生政策变化。";
  if (rank === 4) return "您的积分低于该校往年录取线，录取难度较大。建议：1）优先考虑分数线更匹配的学校；2）了解是否有大学区分流等政策可以利用；3）提前做好多校申请的准备。";
  return "您的积分与该校录取线差距较大，建议选择其他更匹配的学校申请。可以在结果页查看录取概率更高的学校列表。";
}

function drawChart(ctx, w, h, years, values, userScore) {
  const pad = { top: 28, right: 28, bottom: 36, left: 44 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const all = values.concat([userScore]);
  const min = Math.min(...all) - 5;
  const max = Math.max(...all) + 5;
  const range = max - min || 1;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const gy = pad.top + (ch / 4) * g;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(w - pad.right, gy); ctx.stroke();
    ctx.fillStyle = "#aaa";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(Math.round(max - (range / 4) * g)), pad.left - 6, gy + 4);
  }

  const pts = years.map((_, i) => ({
    x: pad.left + (cw / Math.max(years.length - 1, 1)) * i,
    y: pad.top + ch - ((values[i] - min) / range) * ch,
  }));

  years.forEach((y, i) => {
    ctx.fillStyle = "#888"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(y, pts[i].x, h - pad.bottom + 18);
  });

  if (pts.length > 1) {
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let j = 1; j < pts.length; j++) {
      const cx1 = pts[j - 1].x + (pts[j].x - pts[j - 1].x) / 3;
      const cx2 = pts[j].x - (pts[j].x - pts[j - 1].x) / 3;
      ctx.bezierCurveTo(cx1, pts[j - 1].y, cx2, pts[j].y, pts[j].x, pts[j].y);
    }
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.stroke();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, "rgba(37,99,235,.15)");
    grad.addColorStop(1, "rgba(37,99,235,0)");
    ctx.lineTo(pts[pts.length - 1].x, pad.top + ch);
    ctx.lineTo(pts[0].x, pad.top + ch);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  }

  pts.forEach((p, k) => {
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#2563eb"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(String(values[k]), p.x, p.y - 10);
  });

  const uy = pad.top + ch - ((userScore - min) / range) * ch;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(pad.left, uy); ctx.lineTo(w - pad.right, uy);
  ctx.strokeStyle = "#ea4335"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ea4335"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("你: " + userScore, w - pad.right + 2, uy + 4);
}

export default App;
