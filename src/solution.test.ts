import { describe, it, expect } from "vitest";
import { solution } from "./solution.js";

describe("solution", () => {
  // 問題文の例題4ケース
  it("nums=[1,3,5,6], target=5 → 2（中央で発見）", () => {
    expect(solution([1, 3, 5, 6], 5)).toBe(2);
  });

  it("nums=[1,3,5,6], target=2 → 1（中間に挿入）", () => {
    expect(solution([1, 3, 5, 6], 2)).toBe(1);
  });

  it("nums=[1,3,5,6], target=7 → 4（末尾に挿入・配列末尾を超える）", () => {
    expect(solution([1, 3, 5, 6], 7)).toBe(4);
  });

  it("nums=[1,3,5,6], target=0 → 0（先頭に挿入・配列先頭より小さい）", () => {
    expect(solution([1, 3, 5, 6], 0)).toBe(0);
  });

  // 追加エッジケース（二分探索の lo==hi 境界・要素1つ）
  it("nums=[5], target=5 → 0（要素1つ・発見・lo==hi境界）", () => {
    expect(solution([5], 5)).toBe(0);
  });

  it("nums=[5], target=3 → 0（要素1つ・挿入先頭）", () => {
    expect(solution([5], 3)).toBe(0);
  });

  it("nums=[5], target=9 → 1（要素1つ・挿入末尾）", () => {
    expect(solution([5], 9)).toBe(1);
  });

  it("nums=[1,3,5,6], target=1 → 0（配列の先頭要素と一致）", () => {
    expect(solution([1, 3, 5, 6], 1)).toBe(0);
  });

  it("nums=[1,3,5,6], target=6 → 3（配列の末尾要素と一致）", () => {
    expect(solution([1, 3, 5, 6], 6)).toBe(3);
  });

  it("nums=[3,5], target=4 → 1（2要素配列の中間への挿入）", () => {
    expect(solution([3, 5], 4)).toBe(1);
  });
});
