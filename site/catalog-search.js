(() => {
  const input = document.querySelector("[data-game-search-input]");
  const form = document.querySelector("[data-game-search-form]");
  const cards = [...document.querySelectorAll("[data-game-search-text]")];
  const countBadge = document.querySelector("[data-game-count]");
  const emptyState = document.querySelector("[data-game-search-empty]");
  const totalCount = cards.length;

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

    if (countBadge) {
      countBadge.textContent = query
        ? `${visibleCount} 款 / ${totalCount} 款`
        : `${totalCount} 款`;
    }
    emptyState?.classList.toggle("d-none", visibleCount !== 0);
  };

  form?.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", updateResults);
  updateResults();
})();
