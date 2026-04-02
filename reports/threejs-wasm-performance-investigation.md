# Three.js → three.wasm 移行のパフォーマンス調査レポート

> 調査日: 2026-04-02

## 注意: エイプリルフールのジョーク

Three.js公式（@threejs）が2026年4月1日に発表した「three.js → three.wasm」移行は **エイプリルフールのジョーク** です。

### 根拠
- リポジトリ作成日時: 2026年4月1日 UTC 03:44:47
- コミット1件のみ、貢献者mrdoob 1名のみ
- 言語統計: TypeScript 56.1% + HTML 43.9%（Rust/C++なし）
- README: "Q: What can it do? A: It can spin a cube. What more do you need?"
- README: "Should I migrate my production app? Absolutely. What could go wrong?"

### 参考リンク
- [mrdoob/three.wasm](https://github.com/mrdoob/three.wasm)
- [@threejs ツイート](https://x.com/threejs/status/2039157691600536027)

---

## しかし技術的な話は本物: なぜ3DライブラリのWASM化は劇的に速くなるのか

「WASMが速い」ではなく、**JSの3Dレンダリングには6つの構造的ボトルネックがあり、WASMはその全てを同時に解消できる**。

---

### 1. GCポーズ → フレーム落ちの元凶

Three.jsはレンダーループ内で `new Vector3()` 等の一時オブジェクトを大量に生成する。JSのGC（ガベージコレクション）がこれらを回収する際、16.6ms（60fps）のフレーム予算に割り込む。

- **Minor GC**: 数ms → ギリ許容
- **Major GC**: 数十ms → 複数フレーム連続ドロップ

Three.jsのGitHub issue #9525では、Firefoxがソート処理中にメモリ確保→GCポーズ誘発が報告されている。

**WASMの解決策**: RustのRAII、C++のデストラクタにより**決定論的にメモリ解放**。GCポーズという概念が存在しない。

**実例**: Rust+WASMでパーティクルシミュレーションを移行 → 2,500個から1,000,000個（400倍）に規模拡大（DEV Community）。

---

### 2. 数値計算: f64固定 vs f32 SIMD

JSの`Number`型は常にIEEE 754 float64（倍精度）。型指定の余地がない。

| 比較項目 | JS | WASM SIMD |
|---|---|---|
| 精度 | f64固定 | f32選択可能 |
| SIMDレジスタ利用 | 128bitに2値 | 128bitに4値 |
| 行列乗算ベンチマーク | 基準 | 2〜9.5倍高速 |
| 最適化フルオプション | - | 最大24倍 |

Three.jsの`Matrix4.multiply()`は毎フレーム数千回呼ばれるため、ここの高速化は直接的にフレームレートに反映される。

**注意**: f32の精度不足が大規模ワールド座標系で問題になる場合あり。CPU側はf64、GPU送出時にf32キャストするハイブリッド戦略が推奨される。

---

### 3. JIT Deoptimization（型推論の崩壊）

V8は「隠しクラス（Hidden Class）」でオブジェクトの形状を追跡し、インラインキャッシュで高速化する。

- **Monomorphic**（1種類）→ 最適化コード生成
- **Polymorphic**（2〜4種類）→ 複数パス
- **Megamorphic**（5種類以上）→ **最適化を放棄**

3Dシーンのホットループでは`normalize()`, `dot()`, `cross()`, `applyMatrix4()`が毎フレーム数千〜数万回呼ばれる。Megamorphic化すると**2〜20倍の遅延、最悪100倍**。

**WASMの解決策**: `i32, i64, f32, f64`の4型のみの静的型付き命令セット。型推論の崩壊が**原理的に発生しない**。

---

### 4. メモリレイアウト: CPUキャッシュとの関係

JSのオブジェクトはGCヒープ上にバラバラに配置される。

- **キャッシュヒット: ~1ns**
- **キャッシュミス（RAMアクセス）: ~200ns** ← 200倍遅い

WASMはフラットな線形メモリでStructure of Arrays（SoA）パターンが使える：

```
// SoA: キャッシュ効率的
positions_x = [x0, x1, x2, x3, x4, x5, x6, x7, ...]  // 64バイトで8要素
positions_y = [y0, y1, y2, y3, y4, y5, y6, y7, ...]
positions_z = [z0, z1, z2, z3, z4, z5, z6, z7, ...]
```

**実測**: データレイアウト変更のみで40〜60%の性能向上。キャッシュミスが1/4に削減された事例も。

---

### 5. WebGL/WebGPU呼び出しのオーバーヘッド

WASM→WebGLにはFFI遷移コスト（WASMコンテキスト↔ブラウザC++コンテキストのジャンプ）がある。ただしWebGPUとの組み合わせで真価を発揮：

- マルチスレッドでコマンド準備可能
- Compute Pipeline使用可能
- 1000ドローコール/フレーム超でFPS低下が顕在化（Three.jsコミュニティ報告）

---

### 6. マルチスレッド

JSのWeb Workersは`postMessage`でデータをコピーする必要がある。WASMスレッドは`SharedArrayBuffer`で**真のメモリ共有**が可能。

- **TensorFlow.js WASMバックエンド**: SIMD + マルチスレッドで10倍高速化
- **Godot 4.5**: WASM SIMDで物理演算1.5〜2倍向上
- **Squoosh.app**: WASMスレッドで1.5〜3倍高速化

---

## 影響度まとめ

| 要因 | JSの問題 | WASMの解決策 | 影響度 |
|---|---|---|---|
| GCポーズ | フレーム予算を食いつぶす | 決定論的メモリ解放 | 🔴 致命的 |
| JIT deopt | 型推論崩壊で2〜100倍遅延 | 静的型付き命令セット | 🔴 致命的 |
| メモリレイアウト | キャッシュミス200倍 | SoA + 線形メモリ | 🟠 大 |
| 数値計算 | f64固定、SIMD不可 | f32 SIMD 4並列 | 🟠 大 |
| マルチスレッド | データコピー必須 | SharedArrayBuffer共有 | 🟡 中 |
| API呼び出し | WebGL検証コスト | WebGPUとの組合せで有効 | 🟡 中 |

---

## 実プロジェクト事例

| プロジェクト | 結果 |
|---|---|
| Rust+WASM+Three.js パーティクル | 2,500→1,000,000個（400倍） |
| TensorFlow.js WASM | SIMD+マルチスレッドで10倍 |
| Godot 4.5 WASM SIMD | 物理演算1.5〜2倍、ネイティブとの差10〜15% |
| Unity WebGL | ネイティブの50%以上のフレームレート |
| Google Earth WASM | C++コードベースをブラウザに完全移植 |

---

## 出典

- [Three.js GC issue #9525](https://github.com/mrdoob/three.js/issues/9525)
- [Three.js GC issue #7391](https://github.com/mrdoob/three.js/issues/7391)
- [Three.js Matrix4 issue #36](https://github.com/mrdoob/three.js/issues/36)
- [Three.js Vector4 4.8x speedup PR #30779](https://github.com/mrdoob/three.js/pull/30779)
- [From 2,500 to 1,000,000 Particles - DEV Community](https://dev.to/m1kc3b/from-2500-to-1000000-particles-supercharging-a-threejs-demo-with-webassembly-24b)
- [Fast Matrix Math in JS 2: WASM - DEV Community](https://dev.to/ndesmic/fast-matrix-math-in-js-2-wasm-3mbn)
- [Boosting WebAssembly Performance with SIMD and Multi-Threading - InfoQ](https://www.infoq.com/articles/webassembly-simd-multithreading-performance-gains/)
- [Not So Fast: Analyzing the Performance of WebAssembly vs. Native Code (USENIX ATC '19)](https://www.usenix.org/system/files/atc19-jangda.pdf)
- [Optimizing WebGL - Emscripten](https://emscripten.org/docs/optimizing/Optimizing-WebGL.html)
- [JavaScript engine fundamentals: Shapes and Inline Caches - Mathias Bynens](https://mathiasbynens.be/notes/shapes-ics)
- [WebGPU — All of the cores, none of the canvas - surma.dev](https://surma.dev/things/webgpu/)
- [Bevy WASM performance issue #11122](https://github.com/bevyengine/bevy/issues/11122)
