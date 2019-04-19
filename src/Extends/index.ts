import Array from './Array';
import Sprite from './Sprite';
import String from './String';
import Window_Base from './Window_Base';
import Number from './Number';
import { $extends } from '../Core/Core';

$extends('Array', Array);
$extends('Sprite', Sprite);
$extends('String', String);
$extends('Window_Base', Window_Base);
$extends('Number', Number);
