import { $ } from '../Core/Core';
import { Window_HorzCommand, Graphics, Rectangle } from 'mv-lib';

export interface Config {
  okText: string;
  cancelText: string;
  lines: string[];
}

export class ConfirmationWindow extends Window_HorzCommand {
  constructor(
    width: number,
    { okText = 'Ok', cancelText = 'Cancel', lines = ['Are you sure ?'] }: Config
  ) {
    super(0, 0);
    this._okText = okText;
    this._cancelText = cancelText;
    this._headerTexts = lines;
    this._windowWidth = width || 300;
    this.x = Graphics.width / 2 - this.windowWidth() / 2;
    this.y = Graphics.height / 2 - this.windowHeight() / 2;
  }

  windowWidth() {
    return this._windowWidth;
  }

  headerHeight() {
    return (this._headerTexts || []).length * this.lineHeight();
  }

  windowHeight() {
    return super.windowHeight() + this.headerHeight();
  }

  maxCols() {
    return 2;
  }

  makeCommandList() {
    this.addCommand(this._okText, 'ok');
    this.addCommand(this._cancelText, 'cancel');
  }

  drawHeader() {
    this.changeTextColor(this.systemColor());
    for (let i = 0; i < this._headerTexts.length; i++) {
      const text = this._headerTexts[i];
      $(this).drawText(text, 'center', this.lineHeight() * i);
    }
  }

  itemRect(index: number) {
    const rect = new Rectangle(0, 0, 0, 0);
    const maxCols = this.maxCols();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = (index % maxCols) * (rect.width + this.spacing()) - this._scrollX;
    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
    rect.y += this.headerHeight();
    return rect;
  }

  drawAllItems() {
    if (this._headerTexts) {
      this.resetFontSettings();
      this.drawHeader();
      this.contents.fontSize -= 4;
      this.changeTextColor(this.normalColor());
      super.drawAllItems();
    }
  }
}
