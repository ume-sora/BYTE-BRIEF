// フィーチャーグラフィック（1024×500）を Photoshop で組み立てる。
// 画像部品は make-feature-parts.py で作った layers/v3-*.png（最終位置に配置済み）。
// 文字はすべて編集できるテキストレイヤーとして作る。
// 実行: osascript -e 'tell application "Adobe Photoshop 2026" to do javascript (read POSIX file "<このファイル>" as «class utf8»)'
app.displayDialogs = DialogModes.NO;

var DIR = '/Users/mumet/BYTE-BRIEF/ByteBrief-mobile/store-assets/';
var savedUnits = app.preferences.rulerUnits;
var savedTypeUnits = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;

var COLOR = {
  white: 'FFFFFF',
  accent: '00D4FF',
  body: 'B8C1CC',
  muted: '8B96A6',
  muted2: '6B7584'
};

function s(id) { return stringIDToTypeID(id); }
function c(id) { return charIDToTypeID(id); }

function solid(hex) {
  var col = new SolidColor();
  col.rgb.hexValue = hex;
  return col;
}

function placeImage(doc, file, name) {
  var src = app.open(new File(DIR + file));
  src.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
  src.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument = doc;
  doc.activeLayer.name = name;
  return doc.activeLayer;
}

function rgbDesc(hex) {
  var d = new ActionDescriptor();
  d.putDouble(c('Rd  '), parseInt(hex.substr(0, 2), 16));
  d.putDouble(c('Grn '), parseInt(hex.substr(2, 2), 16));
  d.putDouble(c('Bl  '), parseInt(hex.substr(4, 2), 16));
  return d;
}

/**
 * 和文向けの組版を整える。
 * - 文字組み「なし」：和文と英数字の間に自動で入るすき間をなくす
 * - プロポーショナルメトリクス：和文を字面に合わせて詰める
 * - highlights: [{ from, to, color }] の範囲だけ色を変える
 */
function refineText(layer, highlights) {
  app.activeDocument.activeLayer = layer;
  var ref = new ActionReference();
  ref.putEnumerated(c('Lyr '), c('Ordn'), c('Trgt'));
  var textKey = executeActionGet(ref).getObjectValue(s('textKey'));
  var length = textKey.getString(s('textKey')).length;

  // 段落：文字組みを「なし」に
  var paraList = textKey.getList(s('paragraphStyleRange'));
  var newParaList = new ActionList();
  for (var i = 0; i < paraList.count; i++) {
    var range = paraList.getObjectValue(i);
    var para = range.getObjectValue(s('paragraphStyle'));
    para.putString(s('mojiKumiName'), 'Photoshop6MojiKumiNone');
    range.putObject(s('paragraphStyle'), s('paragraphStyle'), para);
    newParaList.putObject(s('paragraphStyleRange'), range);
  }
  textKey.putList(s('paragraphStyleRange'), newParaList);

  // 文字：プロポーショナルメトリクス＋部分的な色
  var base = textKey.getList(s('textStyleRange')).getObjectValue(0).getObjectValue(s('textStyle'));
  base.putBoolean(s('proportionalMetrics'), true);

  var cuts = [0, length];
  var list = highlights || [];
  for (var h = 0; h < list.length; h++) { cuts.push(list[h].from); cuts.push(list[h].to); }
  cuts.sort(function (a, b) { return a - b; });

  var styleList = new ActionList();
  for (var k = 0; k < cuts.length - 1; k++) {
    var from = cuts[k], to = cuts[k + 1];
    if (from === to) continue;
    var style = new ActionDescriptor();
    // base を複製
    for (var j = 0; j < base.count; j++) {
      var key = base.getKey(j);
      var t = base.getType(key);
      if (t == DescValueType.OBJECTTYPE) style.putObject(key, base.getObjectType(key), base.getObjectValue(key));
      else if (t == DescValueType.STRINGTYPE) style.putString(key, base.getString(key));
      else if (t == DescValueType.DOUBLETYPE) style.putDouble(key, base.getDouble(key));
      else if (t == DescValueType.INTEGERTYPE) style.putInteger(key, base.getInteger(key));
      else if (t == DescValueType.BOOLEANTYPE) style.putBoolean(key, base.getBoolean(key));
      else if (t == DescValueType.ENUMERATEDTYPE) style.putEnumerated(key, base.getEnumerationType(key), base.getEnumerationValue(key));
      else if (t == DescValueType.UNITDOUBLE) style.putUnitDouble(key, base.getUnitDoubleType(key), base.getUnitDoubleValue(key));
    }
    for (var m = 0; m < list.length; m++) {
      if (from >= list[m].from && to <= list[m].to) {
        style.putObject(s('color'), c('RGBC'), rgbDesc(list[m].color));
      }
    }
    var r = new ActionDescriptor();
    r.putInteger(s('from'), from);
    r.putInteger(s('to'), to);
    r.putObject(s('textStyle'), s('textStyle'), style);
    styleList.putObject(s('textStyleRange'), r);
  }
  textKey.putList(s('textStyleRange'), styleList);

  var setRef = new ActionReference();
  setRef.putEnumerated(c('TxLr'), c('Ordn'), c('Trgt'));
  var desc = new ActionDescriptor();
  desc.putReference(c('null'), setRef);
  desc.putObject(c('T   '), c('TxLr'), textKey);
  executeAction(c('setd'), desc, DialogModes.NO);
}

function addText(doc, opts) {
  var layer = doc.artLayers.add();
  layer.kind = LayerKind.TEXT;
  layer.name = opts.name;
  var t = layer.textItem;
  t.kind = TextType.POINTTEXT;
  t.contents = opts.text;
  t.font = opts.font;
  t.size = new UnitValue(opts.size, 'px');
  t.color = solid(opts.color);
  t.antiAliasMethod = AntiAlias.SMOOTH;
  if (opts.tracking) t.tracking = opts.tracking;
  if (opts.leading) {
    t.useAutoLeading = false;
    t.leading = new UnitValue(opts.leading, 'px');
  }
  t.position = [new UnitValue(opts.x, 'px'), new UnitValue(opts.y, 'px')];
  refineText(layer, opts.highlights);
  return layer;
}

// 文字列中の部分文字列の範囲（refineText 用）
function span(text, part, color) {
  var from = text.indexOf(part);
  return { from: from, to: from + part.length, color: color };
}

var doc = app.documents.add(1024, 500, 72, 'BYTE BRIEF feature graphic v4', NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
var empty = doc.activeLayer;

// ── 画像レイヤー（下から順に） ──
placeImage(doc, 'layers/v3-background.png', '背景');
empty.remove();
placeImage(doc, 'layers/v3-panel.png', '右パネル');
placeImage(doc, 'layers/v3-phone-back.png', 'アプリ画面（奥：ブリーフィング）');
placeImage(doc, 'layers/v3-phone-front.png', 'アプリ画面（手前：フィード）');
placeImage(doc, 'layers/v3-logo-icon.png', 'アイコン');

// ── 左：コピー ──
addText(doc, { name: '対象', text: 'FOR ENGINEERS & TECH PROFESSIONALS',
  font: 'NotoSansJP-Bold', size: 14, tracking: 120, color: COLOR.accent, x: 60, y: 100 });

var headline = '出社前の5分で、\rテックの今をつかむ。';
addText(doc, { name: '見出し', text: headline,
  font: 'NotoSansJP-Bold', size: 52, leading: 70, color: COLOR.white, x: 58, y: 174,
  highlights: [span(headline, '5分', COLOR.accent)] });

addText(doc, { name: '説明', text: '国内外の主要ITメディアのニュースを、\r朝の1画面でまとめてチェック。',
  font: 'NotoSansJP-Regular', size: 18, leading: 30, color: COLOR.body, x: 60, y: 300 });

// ── 左下：アプリ名 ──
addText(doc, { name: 'アプリ名', text: 'BYTE BRIEF',
  font: 'NotoSansJP-Bold', size: 21, tracking: 20, color: COLOR.white, x: 120, y: 398 });

addText(doc, { name: 'アプリの説明', text: '朝刊型ITニュースアプリ',
  font: 'NotoSansJP-Regular', size: 14, color: COLOR.muted, x: 120, y: 418 });

// ── 保存 ──
var psd = new PhotoshopSaveOptions();
psd.layers = true;
doc.saveAs(new File(DIR + 'feature-graphic.psd'), psd, false);

var png = new PNGSaveOptions();
png.compression = 6;
doc.saveAs(new File(DIR + 'feature-graphic.png'), png, true);

app.preferences.rulerUnits = savedUnits;
app.preferences.typeUnits = savedTypeUnits;

// 書き込んだ文字を返して確認できるようにする
var out = [];
for (var i = 0; i < doc.layers.length; i++) {
  var l = doc.layers[i];
  if (l.kind == LayerKind.TEXT) out.push(l.name + ' = ' + l.textItem.contents.replace(/\r/g, ' / '));
}
'saved: ' + doc.layers.length + ' layers\n' + out.join('\n');
