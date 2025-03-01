import { getNameById, getPriceByName } from './product';

describe('Product Functions', () => {
  describe('getNameById', () => {
    test('存在する商品IDで正しい商品名を返すこと', () => {
      expect(getNameById(1)).toBe('商品A');
      expect(getNameById(3)).toBe('商品C');
      expect(getNameById(5)).toBe('商品E');
    });

    test('存在しない商品IDでundefinedを返すこと', () => {
      expect(getNameById(99)).toBeUndefined();
      expect(getNameById(0)).toBeUndefined();
    });
  });

  describe('getPriceByName', () => {
    test('存在する商品名で正しい価格を返すこと', () => {
      expect(getPriceByName('商品A')).toBe(1000);
      expect(getPriceByName('商品C')).toBe(3000);
      expect(getPriceByName('商品E')).toBe(5000);
    });

    test('存在しない商品名でundefinedを返すこと', () => {
      expect(getPriceByName('商品Z')).toBeUndefined();
      expect(getPriceByName('')).toBeUndefined();
    });
  });
});
