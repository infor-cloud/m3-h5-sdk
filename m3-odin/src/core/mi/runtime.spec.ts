import { MIUtil } from './runtime';

describe('MIUtil', () => {
  describe('#toMIFormat()', () => {
    it('should format a Date', () => {
      const date = new Date();
      date.setFullYear(2019, 7, 20);
      expect(MIUtil.toMIFormat(date)).toEqual('20190820');
    });

    it('should format a number', () => {
      expect(MIUtil.toMIFormat(20190820)).toEqual('20190820');
    });

    it('should format a string', () => {
      expect(MIUtil.toMIFormat('20190820')).toEqual('20190820');
    });

    it('should not throw when given null', () => {
      expect(MIUtil.toMIFormat(null)).toEqual('');
    });
  });
});
