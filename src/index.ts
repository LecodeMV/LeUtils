import * as Core from './Core';
import * as Sprites from './Sprites';
import * as Windows from './Windows';
import './Extends';

const Main = {
  ...Core,
  ...Sprites,
  ...Windows
};
declare var window;
window.LeUtils = Main;
export default Main;
export const $ = Core.$;
