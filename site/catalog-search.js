(() => {
  const input = document.querySelector("[data-game-search-input]");
  const form = document.querySelector("[data-game-search-form]");
  const cards = [...document.querySelectorAll("[data-game-search-text]")];
  const countBadge = document.querySelector("[data-game-count]");
  const status = document.querySelector("[data-game-search-status]");
  const emptyState = document.querySelector("[data-game-search-empty]");

  if (!input || cards.length === 0) return;

  const normalize = (value) => String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  const isSubsequence = (needle, haystack) => {
    let needleIndex = 0;
    for (const character of haystack) {
      if (character === needle[needleIndex]) needleIndex += 1;
      if (needleIndex === needle.length) return true;
    }
    return needle.length === 0;
  };

  const matches = (query, text) => {
    if (!query) return true;
    return query.split(/\s+/).every((token) => (
      text.includes(token) || isSubsequence(token, text)
    ));
  };

  const updateResults = () => {
    const query = normalize(input.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const visible = matches(query, normalize(card.dataset.gameSearchText ?? ""));
      card.classList.toggle("d-none", !visible);
      if (visible) visibleCount += 1;
    });

    if (countBadge) countBadge.textContent = `${visibleCount} 款`;
    if (status) {
      status.textContent = query
        ? `找到 ${visibleCount} 款符合搜尋條件的遊戲。`
        : `共 ${visibleCount} 款遊戲。`;
    }
    emptyState?.classList.toggle("d-none", visibleCount !== 0);
  };

  form?.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", updateResults);
  updateResults();
})();
