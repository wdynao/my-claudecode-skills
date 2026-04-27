# frozen_string_literal: true

# 文字列が回文かどうかを判定するモジュール。
# 詳細仕様および時間計算量は README.md を参照。
module Palindrome
  module_function

  # 時間計算量: O(n) （詳細は README.md 参照）
  #
  # nil は意味のある文字列でないため ArgumentError を発生させる。
  # String 以外（Integer 等）も同様に ArgumentError とする。
  # TypeError は型の不一致を示すが、Ruby 標準ライブラリでは
  # 暗黙変換を期待する文脈で使われる慣習があるため、ここでは
  # 「引数の前提条件違反」を明示する ArgumentError を採用する。
  #
  # 空文字 "" は str == str.reverse が true になるため回文として扱う。
  def palindrome?(str)
    raise ArgumentError, "expected String, got #{str.class}" unless str.is_a?(String)

    str == str.reverse
  end
end
