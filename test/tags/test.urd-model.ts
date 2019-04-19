import { Model } from '@urd/core';

export const testModel: Model = {
  my_tag: {
    type: 'structure',
    //disableEval: true,
    fields: {
      nbr: {
        type: 'number',
        //disableEval: true
      },
      str: {
        type: 'string'
      },
      list: {
        type: 'list'
      },
      obj: {
        type: 'map'
      }
    }
  }
};
export default testModel;
