def solution(text: str) -> int:
    return len({w for w in text.translate(str.maketrans('.,"', '   ')).split() if w[0].isupper() or w[0].isdigit()})
