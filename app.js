(function () {
  "use strict";

  var CLIENT_URL = "https://sleep-medical.net/lp/gen/af/medical-af/form/?cats_not_organic=true";
  var QUESTION_COUNT = 7;
  // Keep the existing thresholds used when BMI was skipped; do not invent a new calibration.
  var SCORE = { level2: 6, level3: 13, apneaAnswer: 4, apneaScore: 9 };
  var state = {
    answers: new Array(QUESTION_COUNT).fill(null), unknown: {}, started: false,
    completed: false, resultLevel: null
  };

  var blocks = ["PR\n\n30〜69歳の約3人に1人が黄信号!?\n\n睡眠時無呼吸リスク\n30秒セルフチェック\n\nあなたはいくつ当てはまる？\n\n［チェックをはじめる］\n\n※30〜69歳の日本人において、AHI5以上の閉塞性睡眠時無呼吸（OSA）が32.7%、約2,200万人と推計された報告に基づく表現です。全国実測値ではなくモデル推計であり、「3人に1人が睡眠時無呼吸症候群と診断されている」という意味ではありません。\n※本チェックは、いびき・眠気・睡眠中の呼吸に関するサインを整理する独自コンテンツです。医学的な診断、重症度、発症確率を判定するものではありません。\n\n\n", "\nQ1\n", "\n\n家族や同室の人から\n「いびきが大きい」と言われますか？\n\n1　まったくない\n2　ほとんどない\n3　時々ある\n4　よくある\n5　ほぼ毎晩\n\n［分からない］\n\n\n", "\nQ2\n", "\n\n寝ている間に\n「息が止まっていた」と言われたことはありますか？\n\n1　言われたことはない\n2　一度だけある\n3　時々ある\n4　よくある\n5　何度も言われている\n\n［分からない／一人で寝ている］\n\n\n", "\nQ3\n", "\n\n寝ている途中で\n息苦しさや、あえぐような感じで\n目が覚めることはありますか？\n\n1　まったくない\n2　ほとんどない\n3　時々ある\n4　よくある\n5　頻繁にある\n\n\n", "\nQ4\n", "\n\n十分寝たはずなのに\n朝から疲れが残っていることはありますか？\n\n1　まったくない\n2　ほとんどない\n3　時々ある\n4　よくある\n5　ほぼ毎朝\n\n\n", "\nQ5\n", "\n\n会議中や移動中など\n起きていたい時間に眠気を感じますか？\n\n1　まったくない\n2　ほとんどない\n3　時々ある\n4　よくある\n5　ほぼ毎日\n\n\n", "\nQ6\n", "\n\n高血圧を指摘されたことがありますか？\nまたは血圧の薬を飲んでいますか？\n\n［はい］\n［いいえ］\n［分からない］\n\n\n", "\nQ7\n", "\n\n50歳以上ですか？\n\n［はい］\n［いいえ］\n\n\n", "\nQ8\n", "\n\n身長と体重を入力してください\n\n身長［　　　］cm\n体重［　　　］kg\n\n［スキップする］\n\n\n", "\nCHECK RESULT\nLEVEL 1\n", "\n\n今の回答では、\n強く気になるサインは少なめでした\n\n今回の回答では、\n\nいびきや朝の疲れ、\n日中の眠気など、\n\n強く気になるサインは\nそれほど多くありませんでした。\n\nただし、\n\n「この結果なら大丈夫」\n\nという意味ではありません。\n\n寝ている間の呼吸は、\n自分では分かりにくいものです。\n\n今後、\n\n「息が止まっていた」\n\nと家族から言われたり、\n\n朝から強い眠気が続いたりしたら、\n\nその変化は\nそのままにしないでください。\n\n\n", "\nCHECK RESULT\nLEVEL 2\n", "\n\n気になるサインが\nいくつか重なっています\n\n今回の回答では、\n\nいびき\n\n朝の疲れ\n\n日中の眠気\n\nなど、\n\n気になるサインが\nいくつか重なっています。\n\n一つひとつなら、\n\n寝不足や仕事の疲れなど、\n別の原因かもしれません。\n\nただ、\n\nいくつも当てはまっているのに、\n\n「まあ、まだ大丈夫でしょ」\n\n「歳のせいでしょ」\n\nで終わらせてしまうのは、\n\n一度考え直してもいいかもしれません。\n\nまだ、\n\n自分で病名を\n決める必要はありません。\n\nでも、\n\n「まだ大丈夫」で\n放置し続ける必要もありません。\n\n\n", "\nCHECK RESULT\nLEVEL 3\n", "\n\n一度しっかり確認したいサインが\n複数あります\n\n今回の回答では、\n\n「息が止まっていた」という指摘や、\n\nいびき、\n\n朝や日中の不調など、\n\n一度しっかり確認したいサインが\n重なっています。\n\nもちろん、\n\nこのチェックだけで、\n\n「睡眠時無呼吸症候群です」\n\nとは判断できません。\n\nただ、\n\nここまで思い当たることがあるなら、\n\n「そのうち考えよう」\n\nで先延ばしにせず、\n\n一度、\n医療機関へ相談することをおすすめします。\n\n\n"];
  function clean(i) { return blocks[i].replace(/^\s+|\s+$/g, ""); }
  function lines(i) { return clean(i).split("\n").filter(function (x) { return x.trim(); }); }
  function paragraphs(i) { return clean(i).split(/\n\s*\n/).filter(function (x) { return x.trim(); }); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function track(name, detail) {
    var payload = Object.assign({ event: name }, detail || {});
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent("lp:" + name, { detail: payload }));
  }

  function arrow(extra) {
    var node = el("div", "down-arrow" + (extra ? " " + extra : ""));
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = '<svg viewBox="0 0 64 64" fill="none"><path d="M32 6v39M15 30l17 18 17-18" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return node;
  }

  function picture(src, alt, extra, width, height) {
    var figure = el("figure", "visual-break" + (extra ? " " + extra : ""));
    var image = document.createElement("img");
    image.src = src;
    image.alt = alt || "";
    image.width = width || 1536;
    image.height = height || 1024;
    image.loading = "lazy";
    image.decoding = "async";
    figure.append(image);
    return figure;
  }

  function renderHero() {
    var hero = document.getElementById("hero");
    var copy = lines(0);
    var image = document.createElement("img");
    image.className = "hero-image";
    image.src = "hero-provided-v18-opt-v23.webp";
    image.alt = "30〜69歳の3人に1人が黄信号!? いびきだけじゃない！ 睡眠時無呼吸リスク 30秒セルフチェック あなたはいくつ当てはまる？";
    image.width = 1122;
    image.height = 1402;
    image.decoding = "async";

    var notes = el("details", "hero-note-details");
    notes.append(el("summary", "", "※医学的な診断ではありません（注記）"));
    var noteBody = el("div", "hero-notes");
    copy.slice(6).forEach(function (line) { noteBody.append(el("p", "", line)); });
    notes.append(noteBody);
    var title = el("h1", "sr-only", image.alt);
    title.id = "hero-title";
    hero.append(el("span", "pr-label", "PR:スリープメディカルクリニック"), title, image, notes);
  }

  function parseQuestion(index) {
    var qLines = lines(2 + index * 2);
    var first = qLines.findIndex(function (x) { return /^[1-5]　/.test(x) || /^［/.test(x); });
    return { label: clean(1 + index * 2), question: qLines.slice(0, first).join("\n"), options: qLines.slice(first) };
  }

  function isUnknown(option) { return option.indexOf("分からない") >= 0 || option.indexOf("スキップ") >= 0; }
  function scoreOption(index, optionIndex) {
    if (index <= 4) return optionIndex;
    if (index === 5) return optionIndex === 0 ? 2 : 0;
    if (index === 6) return optionIndex === 0 ? 1 : 0;
    return 0;
  }
  function answerCount() { return state.answers.filter(function (x) { return x !== null; }).length; }

  function scrollToQuizTarget(target) {
    if (!target) return;
    requestAnimationFrame(function () {
      target.focus({preventScroll: true});
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start"
      });
    });
  }

  function updateProgress(answeredIndex) {
    var count = answerCount();
    document.querySelectorAll(".quiz-card").forEach(function (card, index) { card.classList.toggle("is-answered", state.answers[index] !== null); });
    if (count === QUESTION_COUNT) {
      completeQuiz();
      scrollToQuizTarget(document.getElementById("resultHost"));
    } else if (typeof answeredIndex === "number") {
      // Advance in order; if the final question is answered early, return to the first missing answer.
      var nextIndex = answeredIndex < QUESTION_COUNT - 1 ? answeredIndex + 1 : state.answers.findIndex(function (answer) { return answer === null; });
      scrollToQuizTarget(document.getElementById("question-" + (nextIndex + 1)));
    }
  }

  function beginCheck() {
    if (!state.started) { state.started = true; track("check_start"); }
  }

  function selectAnswer(index, option, optionIndex, button) {
    beginCheck();
    var card = document.querySelector('[data-question="' + (index + 1) + '"]');
    card.querySelectorAll(".answer").forEach(function (item) {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    state.answers[index] = { score: isUnknown(option) ? 0 : scoreOption(index, optionIndex), optionIndex: optionIndex };
    if (isUnknown(option)) state.unknown["q" + (index + 1)] = true;
    else delete state.unknown["q" + (index + 1)];
    track("question_" + (index + 1) + "_answer", {
      question_index: index + 1, answer_index: optionIndex + 1,
      answer_kind: isUnknown(option) ? "unknown" : "answered"
    });
    updateProgress(index);
  }

  function renderDiagnosis() {
    var root = document.getElementById("diagnosis");
    var stack = el("div", "question-stack");
    for (var index = 0; index < QUESTION_COUNT; index += 1) {
      (function (questionIndex) {
        var question = parseQuestion(questionIndex);
        var card = el("article", "quiz-card");
        card.dataset.question = String(questionIndex + 1);
        card.id = "question-" + (questionIndex + 1);
        card.tabIndex = -1;
        var top = el("div", "quiz-topline");
        top.append(el("span", "q-badge", question.label), el("span", "q-count", (questionIndex + 1) + " / " + QUESTION_COUNT));
        card.append(top, el("h2", "quiz-question", question.question));
        if (window.QUIZ_IMAGE_ASSETS_READY) {
          card.append(picture("quiz-q" + (questionIndex + 1) + "-opt-v23.webp", "", "quiz-scene", 1536, 864));
        }
        {
          var answers = el("div", "answers");
          question.options.forEach(function (option, optionIndex) {
            var button = el("button", "answer" + (isUnknown(option) ? " unknown" : ""), option);
            button.type = "button";
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", function () { selectAnswer(questionIndex, option, optionIndex, button); });
            answers.append(button);
          });
          card.append(answers);
        }
        stack.append(card);
      }(index));
    }

    var resultHost = el("div", "result-host");
    resultHost.id = "resultHost";
    resultHost.tabIndex = -1;
    resultHost.hidden = true;
    root.append(stack, resultHost);
  }

  function resultLevel() {
    var total = state.answers.reduce(function (sum, answer) { return sum + (answer ? answer.score : 0); }, 0);
    var q2 = state.answers[1] && !state.unknown.q2 ? state.answers[1].optionIndex + 1 : 0;
    if (total >= SCORE.level3 || (q2 >= SCORE.apneaAnswer && total >= SCORE.apneaScore)) return 3;
    if (total >= SCORE.level2) return 2;
    return 1;
  }

  function completeQuiz() {
    var first = !state.completed;
    state.completed = true;
    state.resultLevel = resultLevel();
    if (first) track("check_complete", { unknown_count: Object.keys(state.unknown).length });
    track("result_level_" + state.resultLevel);
    renderResult(state.resultLevel, false);
  }

  function renderResult(level, scroll) {
    var host = document.getElementById("resultHost");
    host.hidden = false;
    host.replaceChildren();
    var headingIndex = 15 + level * 2;
    var result = el("section", "result level-" + level);
    var heading = lines(headingIndex);
    var top = el("div", "result-top");
    top.append(el("p", "result-label", heading[0]));
    var lead = el("div", "result-lead");
    var badge = el("p", "result-level");
    badge.append(el("span", "result-level-word", "LEVEL "), el("strong", "result-level-number", String(level)));
    var headline = el("h2", "result-headline", paragraphs(headingIndex + 1)[0].replace(/\n/g, ""));
    lead.append(badge, headline); top.append(lead);
    result.append(top, resultAnswerReview());
    var copy = el("div", "result-copy");
    var resultGroups = {
      1:[[0],[1,2,3],[4,5,6],[7],[8,9,10,11,12]],
      2:[[0],[1],[2,3,4],[5,6],[7,8],[9,10,11,12,13,14],[15,16],[17,18]],
      3:[[0],[1,2,3,4,5],[6,7,8,9],[10,11,12,13,14]]
    };
    var original = paragraphs(headingIndex + 1);
    resultGroups[level].forEach(function (group, n) {
      if (n === 0) return; // The original result headline is now in result-top.
      var p = el("p", "");
      if (level === 2 && n === 2) p.className = "result-signs";
      group.forEach(function (index) { p.append(el("span", "", original[index].replace(/\n/g, ""))); });
      copy.append(p);
    });
    result.append(copy);
    host.append(result);
    if (scroll) requestAnimationFrame(function () {
      host.scrollIntoView({block: "start", behavior: "smooth"});
      host.focus({preventScroll: true});
    });
  }

  function resultAnswerReview() {
    var review = el("div", "result-review");
    review.append(el("p", "result-review-label", "回答のふり返り（一部）"));
    var grid = el("div", "result-review-grid");
    var names = ["いびきの指摘", "呼吸の指摘", "夜中の目覚め", "朝の疲れ", "日中の眠気"];
    // Reuse the selected options verbatim; these are answers, not a new diagnosis.
    var candidates = [1, 0, 3, 4, 2].map(function (index, priority) {
      return {index: index, priority: priority, score: state.answers[index].score};
    });
    candidates.sort(function (a, b) { return b.score - a.score || a.priority - b.priority; });
    candidates.slice(0, 3).sort(function (a, b) { return a.index - b.index; }).forEach(function (item) {
      var index = item.index;
      var card = el("div", "result-answer-card"); card.dataset.answerQuestion = String(index + 1);
      card.append(picture("quiz-q" + (index + 1) + "-opt-v23.webp", "", "result-answer-photo", 1536, 864));
      card.append(el("p", "result-answer-topic", names[index]));
      var option = parseQuestion(index).options[state.answers[index].optionIndex];
      card.append(el("p", "result-answer-value", option.replace(/^[1-5]　/, "").replace(/^［|］$/g, "")));
      grid.append(card);
    });
    review.append(grid); return review;
  }

  function buildArticle() {
    var sticky = document.querySelector("#stickyCta a");
    sticky.href = CLIENT_URL;
    sticky.setAttribute("aria-label", "今すぐ無料カウンセリング予約");
    sticky.innerHTML = '<span class="cta-sticky-copy"><span class="cta-sticky-now">今すぐ</span>無料カウンセリング予約</span><span class="cta-sticky-arrow" aria-hidden="true">›</span>';
    document.querySelectorAll("[data-track='cta_click']").forEach(function(link) {
      link.addEventListener("click", function() {track("cta_click", {placement:link.dataset.placement, result_level:state.resultLevel});});
    });
    document.querySelectorAll("figure img, .hero-image, .client-journey img").forEach(function(img) {
      function setSize(){if(img.naturalWidth){img.width=img.naturalWidth;img.height=img.naturalHeight;}}
      if(img.complete) setSize();else img.addEventListener("load",setSize,{once:true});
    });
  }

  function observeSections() {
    var sticky = document.getElementById("stickyCta"), seen = {}, ticking = false;
    var clinic = document.querySelector('[data-block="39"]');
    var final = document.querySelector("#article-flow #consult .cta");
    function updateSticky() {
      ticking = false;
      var finalBox = final.getBoundingClientRect();
      var inlineVisible = Array.from(document.querySelectorAll("#article-flow .cta")).some(function(button) { var box = button.getBoundingClientRect(); return box.top < window.innerHeight && box.bottom > 0; });
      sticky.hidden = !(clinic.getBoundingClientRect().top <= 24 && finalBox.top > window.innerHeight && !inlineVisible);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateSticky); }
    }, {passive: true});
    window.addEventListener("resize", updateSticky);
    updateSticky();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen[entry.target.dataset.block]) return;
        var block = entry.target.dataset.block; seen[block] = true;
        if (block === "39") track("smc_section_view", {result_level: state.resultLevel});
        if (block === "41") track("treatment_section_view", {result_level: state.resultLevel});
      });
    }, {threshold: 0.1});
    observer.observe(clinic);
    observer.observe(document.querySelector('[data-block="41"]'));
  }

  window.trackBookingFormView = function () { track("booking_form_view"); };
  renderHero(); renderDiagnosis(); buildArticle(); observeSections();
}());
