# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/palindrome"

class TestPalindrome < Minitest::Test
  # --- 真となるケース ---

  def test_multibyte_palindrome
    assert Palindrome.palindrome?("たけやぶやけた")
  end

  def test_ascii_level
    assert Palindrome.palindrome?("level")
  end

  def test_ascii_racecar
    assert Palindrome.palindrome?("racecar")
  end

  def test_single_char
    assert Palindrome.palindrome?("a")
  end

  def test_empty_string
    assert Palindrome.palindrome?("")
  end

  def test_numeric_string_palindrome
    assert Palindrome.palindrome?("12321")
  end

  # --- 偽となるケース ---

  def test_non_palindrome_hello
    refute Palindrome.palindrome?("hello")
  end

  def test_multibyte_non_palindrome
    refute Palindrome.palindrome?("たけやぶやけ")
  end

  def test_case_sensitive
    # 厳密一致なので大文字小文字が違えば false
    refute Palindrome.palindrome?("Racecar")
  end

  def test_string_with_spaces_non_palindrome
    refute Palindrome.palindrome?("ab a")
  end

  # --- 例外ケース ---

  def test_nil_raises_argument_error
    err = assert_raises(ArgumentError) { Palindrome.palindrome?(nil) }
    assert_match(/expected String/, err.message)
    assert_match(/NilClass/, err.message)
  end

  def test_integer_raises_argument_error
    err = assert_raises(ArgumentError) { Palindrome.palindrome?(12321) }
    assert_match(/expected String/, err.message)
    assert_match(/Integer/, err.message)
  end

  # --- エンコーディング関連テスト ---

  def test_explicit_utf8_palindrome
    s = "たけやぶやけた".encode(Encoding::UTF_8)
    assert Palindrome.palindrome?(s)
  end

  def test_ascii_8bit_multibyte_is_byte_reversed
    # 仕様メモ: 本メソッドは UTF-8 文字列を前提とする。
    # ASCII-8BIT (binary) でマルチバイト文字を渡すとバイト単位で逆順になり、
    # 文字としての回文性は保証されない。実装の挙動を明文化するためのテスト。
    utf8 = "たけやぶやけた"
    binary = utf8.dup.force_encoding(Encoding::ASCII_8BIT)
    # バイト列として見ても元と等しい場合のみ true。
    # 「たけやぶやけた」は文字単位では回文だが、UTF-8バイト列では回文ではないため false になる。
    refute Palindrome.palindrome?(binary)
  end

  # --- 空白を含む真ケース ---

  def test_string_with_spaces_palindrome
    # 厳密一致のため、空白も「文字」として扱われる。
    # "a a" は前後対称なので true。
    assert Palindrome.palindrome?("a a")
  end

  def test_only_spaces_palindrome
    assert Palindrome.palindrome?("   ")
  end

  # --- 性能/挙動の付記テスト ---

  def test_large_palindrome
    # 長さ10000の回文でも正しく true を返すこと
    half = "a" * 5000
    large = half + half.reverse
    assert Palindrome.palindrome?(large)
  end
end
