import { Window_Base, TouchInput } from 'mv-lib';

export class WindowScrollable extends Window_Base {
  contentsHeight() {
    return this._lines * this.lineHeight() + this.standardPadding() * 2;
  }

  visibleLines() {
    return 1;
  }

  refresh() {
    this.contents.clear();
    this.makeLineNumbers.apply(this);
    this.createContents();
    this.drawConcents.apply(this);
  }

  makeLineNumbers() {
    if (!this._lines) this._lines = 1;
    this._hiddenLines = this._lines - this.visibleLines();
  }

  update() {
    super.update();
    this.downArrowVisible = this.needScroll();
    if (this.isMouseInsideFrame()) this.processWheel();
  }

  needScroll() {
    return this._hiddenLines > 0;
  }

  processWheel() {
    let threshold = 20;
    if (TouchInput.wheelY >= threshold && this.needScroll()) {
      this.scrollDown();
    }
    if (TouchInput.wheelY <= -threshold && this.origin.y > 0) {
      this.scrollUp();
    }
  }

  scrollDown() {
    this.origin.y += this.scrollSpeed();
    this._hiddenLines--;
  }

  scrollUp() {
    this.origin.y -= this.scrollSpeed();
    this._hiddenLines++;
  }

  scrollSpeed() {
    return this.lineHeight();
  }
}
