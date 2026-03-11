import { useMemo, useState } from "react";
import districtData from "../../data/districts/index.js";
import scoreEngine from "../../utils/score-engine.js";

function App() {
  const districtList = districtData?.districtList || [];
  const [districtKey, setDistrictKey] = useState(districtList[0]?.key || "futian");
  const [stage, setStage] = useState("xiaoxue");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const selectedDistrict = useMemo(
    () => districtData.getDistrict(districtKey),
    [districtKey]
  );

  const visibleQuestions = useMemo(
    () => scoreEngine.getVisibleQuestions(districtKey, answers, stage),
    [districtKey, answers, stage]
  );

  const allAnswered = useMemo(
    () => scoreEngine.isAllQuestionsAnswered(districtKey, answers, stage),
    [districtKey, answers, stage]
  );

  const result = useMemo(() => {
    if (!submitted || !allAnswered) return null;
    return scoreEngine.calculateScore(districtKey, answers, stage);
  }, [submitted, allAnswered, districtKey, answers, stage]);

  const schools = useMemo(() => {
    if (!result) return [];
    const userArea = scoreEngine.getUserArea(answers);
    const all = scoreEngine.getSchools(districtKey, stage);
    if (userArea === "all") return all;
    return all.filter((item) => !item.area || item.area === userArea);
  }, [result, answers, districtKey, stage]);

  const onDistrictChange = (key) => {
    setDistrictKey(key);
    setAnswers({});
    setSubmitted(false);
  };

  const onStageChange = (value) => {
    setStage(value);
    setAnswers({});
    setSubmitted(false);
  };

  const onSingleChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
    setSubmitted(false);
  };

  return (
    <main className="container">
      <h1>深圳积分入学助手（H5 预览）</h1>
      <p className="desc">已复用小程序积分规则，可在浏览器中实时预览计算结果。</p>

      <section className="panel">
        <div className="row">
          <label>区域</label>
          <select value={districtKey} onChange={(e) => onDistrictChange(e.target.value)}>
            {districtList.map((district) => (
              <option key={district.key} value={district.key}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <label>学段</label>
          <select value={stage} onChange={(e) => onStageChange(e.target.value)}>
            <option value="xiaoxue">幼升小</option>
            <option value="chuzhong">小升初</option>
          </select>
        </div>

        <p className="hint">{selectedDistrict?.description}</p>
      </section>

      <section className="panel">
        <h2>问答表单</h2>
        {visibleQuestions.map((q) => (
          <div className="question" key={q.id}>
            <div className="title">{q.title}</div>
            {q.subtitle ? <div className="subtitle">{q.subtitle}</div> : null}
            {q.type === "single" ? (
              <select
                value={answers[q.id] || ""}
                onChange={(e) => onSingleChange(q.id, e.target.value)}
              >
                <option value="">请选择</option>
                {(q.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={q.min ?? 0}
                max={q.max ?? 9999}
                placeholder={q.placeholder || "请输入"}
                value={answers[q.id] ?? ""}
                onChange={(e) => onSingleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <button className="primary" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
          计算积分
        </button>
      </section>

      {result ? (
        <section className="panel">
          <h2>计算结果</h2>
          <p>
            总分：<strong>{result.totalScore}</strong>（{result.category}）
          </p>
          <ul>
            {result.details.map((item) => (
              <li key={item.label}>
                {item.label}：{item.value}
              </li>
            ))}
          </ul>

          <h3>匹配学校（{schools.length} 所）</h3>
          <ul>
            {schools.slice(0, 10).map((school) => (
              <li key={school.name}>
                {school.name}（2025：{school.scores?.[2025] ?? "-"}）
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

export default App;
