/**
 * 昇順ソート済み int 型配列 nums から target のインデックスを返す。
 * 存在しない場合は、昇順を保つために挿入すべきインデックスを返す。
 *
 * @param nums 昇順ソート済み・重複なしの整数配列 (1 <= nums.length <= 10000)
 * @param target 検索対象の整数
 * @returns target のインデックス、または挿入位置のインデックス
 */
export function solution(nums: readonly number[], target: number): number {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
