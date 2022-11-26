import { INumberFormatOptions } from './types';
import { ArrayUtil, NumUtil, CoreUtil, HttpUtil, StringUtil } from './util';

describe('Util ArrayUtil', () => {
   const value1 = { foo: 'bar 9' };
   const value2 = { foo: 'bar 2' };
   const value3 = { foo: 'bar 1' };
   const value4 = { foo: 'Bar 9' };

   it('should return right value from contains', () => {
      const value = 'foo';
      expect(ArrayUtil.contains(undefined as unknown as [], value)).toBe(false);
      expect(ArrayUtil.contains([], value)).toBe(false);
      expect(ArrayUtil.contains([value], value)).toBe(true);
   });

   it('should sort array', () => {
      const array = [value1, value2, value3, value2, value4];

      expect(ArrayUtil.sortByProperty(array, 'foo')).toEqual([
         value4,
         value3,
         value2,
         value2,
         value1,
      ]);
      expect(array).toEqual([value4, value3, value2, value2, value1]); // array isn't immutable
      expect(
         ArrayUtil.sortByProperty(array, 'foo', { ignoreCase: true })
      ).toEqual([value3, value2, value2, value4, value1]);
      expect(ArrayUtil.sortByProperty([value1, value2, value3], 'bar')).toEqual(
         [value1, value2, value3]
      );
   });

   it('should remove item from array', () => {
      const array = [value1, value2, value3, value2];

      ArrayUtil.remove(array, value2);
      expect(array).toEqual([value1, value3, value2]);
   });

   it('should remove item from array by property', () => {
      const array = [value1, value2, value3, value3];

      expect(ArrayUtil.removeByProperty(array, 'foo', value3.foo)).toBe(value3);
      expect(ArrayUtil.removeByProperty(array, 'foo', 'bar')).toBeNull();
      expect(ArrayUtil.removeByProperty(array, 'bar', value3.foo)).toBeNull();
      expect(array).toEqual([value1, value2, value3]);
   });

   it('should remove item from array by predicate', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.removeByPredicate(array, predicate)).toBe(value1);
      expect(ArrayUtil.removeByPredicate(array, predicate)).toBe(value3);
      expect(ArrayUtil.removeByPredicate(array, predicate)).toBeNull();
      expect(array).toEqual([value2, value1]);
      expect(predicate).toHaveBeenCalledTimes(5);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value2],
         [value3],
         [value2],
         [value1],
      ]);
   });

   it('should find index of item from array by predicate', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.indexByPredicate(array, predicate)).toBe(0);
      expect(ArrayUtil.indexByPredicate(array, predicate)).toBe(1);
      expect(ArrayUtil.indexByPredicate(array, predicate)).toBe(-1);
      expect(array).toEqual([value1, value2, value3, value1]);
      expect(predicate).toHaveBeenCalledTimes(7);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value1],
         [value2],
         [value1],
         [value2],
         [value3],
         [value1],
      ]);
   });

   it('should find index of item from array by property', () => {
      const array = [value1, value2, value3, value3];

      expect(ArrayUtil.indexByProperty(array, 'foo', value3.foo)).toBe(2);
      expect(ArrayUtil.indexByProperty(array, 'foo', 'bar')).toBe(-1);
      expect(ArrayUtil.indexByProperty(array, 'bar', value3.foo)).toBe(-1);
      expect(array).toEqual([value1, value2, value3, value3]);
   });

   it('should find item from array by property', () => {
      const array = [value1, value2, value3, value3];

      expect(ArrayUtil.itemByProperty(array, 'foo', value3.foo)).toBe(value3);
      expect(ArrayUtil.itemByProperty(array, 'foo', 'bar')).toBeNull();
      expect(ArrayUtil.itemByProperty(array, 'bar', value3.foo)).toBeNull();
      expect(array).toEqual([value1, value2, value3, value3]);
   });

   it('should find item from array by predicate', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.itemByPredicate(array, predicate)).toBe(value1);
      expect(ArrayUtil.itemByPredicate(array, predicate)).toBe(value2);
      expect(ArrayUtil.itemByPredicate(array, predicate)).toBeNull();
      expect(array).toEqual([value1, value2, value3, value1]);
      expect(predicate).toHaveBeenCalledTimes(7);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value1],
         [value2],
         [value1],
         [value2],
         [value3],
         [value1],
      ]);
   });

   it('should filter item from array by predicate', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.filterByPredicate(array, predicate)).toEqual([
         value1,
         value3,
      ]);
      expect(array).toEqual([value1, value2, value3, value1]);
      expect(predicate).toHaveBeenCalledTimes(4);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value2],
         [value3],
         [value1],
      ]);
   });

   it('should conatin item from array by property', () => {
      const array = [value1, value2, value3, value3];

      expect(ArrayUtil.containsByProperty(array, 'foo', value3.foo)).toBe(true);
      expect(ArrayUtil.containsByProperty(array, 'foo', 'bar')).toBe(false);
      expect(ArrayUtil.containsByProperty(array, 'bar', value3.foo)).toBe(
         false
      );
      expect(array).toEqual([value1, value2, value3, value3]);
   });

   it('should return last item from array', () => {
      const array = [value1, value2, value3, value2];

      expect(ArrayUtil.last(array)).toBe(value2);
      expect(ArrayUtil.last(undefined as unknown as [])).toBeNull();
   });

   it('should find item from array by predicate 2', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.find(array, predicate)).toBe(value1);
      expect(ArrayUtil.find(array, predicate)).toBe(value2);
      expect(ArrayUtil.find(array, predicate)).toBeNull();
      expect(ArrayUtil.find(undefined as unknown as [], predicate)).toBeNull();
      expect(array).toEqual([value1, value2, value3, value1]);
      expect(predicate).toHaveBeenCalledTimes(7);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value1],
         [value2],
         [value1],
         [value2],
         [value3],
         [value1],
      ]);
   });

   it('should find all items from array by predicate', () => {
      const array = [value1, value2, value3, value1];
      const predicate = jasmine
         .createSpy()
         .and.returnValues(true, false, true, false);

      expect(ArrayUtil.findAll(array, predicate)).toEqual([value1, value3]);
      expect(ArrayUtil.findAll(array, predicate)).toEqual([]);
      expect(
         ArrayUtil.findAll(undefined as unknown as [], predicate)
      ).toBeNull();
      expect(array).toEqual([value1, value2, value3, value1]);
      expect(predicate).toHaveBeenCalledTimes(8);
      expect(predicate.calls.allArgs()).toEqual([
         [value1],
         [value2],
         [value3],
         [value1],
         [value1],
         [value2],
         [value3],
         [value1],
      ]);
   });

   it('should move item in array', () => {
      const array = [value1, value2, value3, value1];

      ArrayUtil.move(array, 1, 2);
      expect(array).toEqual([value1, value3, value2, value1]);
      ArrayUtil.move(array, 1, 5);
      expect(array as any).toEqual([
         value1,
         value2,
         value1,
         undefined,
         undefined,
         value3,
      ]);
   });

   it('should swap items in array', () => {
      const array = [value1, value2, value3, value1];

      ArrayUtil.swap(array, 1, 2);
      expect(array).toEqual([value1, value3, value2, value1]);
      ArrayUtil.swap(array, 1, 5);
      expect(array as any).toEqual([
         value1,
         undefined,
         value2,
         value1,
         undefined,
         value3,
      ]);
   });
});

describe('Util NumUtil', () => {
   const defaultOptions = NumUtil['defaultOptions'];
   const defaultSeparator = NumUtil['defaultSeparator'];

   afterEach(() => {
      NumUtil['defaultOptions'] = defaultOptions;
      NumUtil['defaultSeparator'] = defaultSeparator;
   });

   it('should return default options', () => {
      expect(NumUtil.getDefaultOptions()).toBe(NumUtil['defaultOptions']);
   });

   it('should modify default options', () => {
      const option = { foo: 'bar' } as INumberFormatOptions;
      NumUtil.setDefaultOptions(option);
      expect(NumUtil.getDefaultOptions()).toBe(option);
   });

   it('should formats a number', () => {
      expect(NumUtil.format('')).toBe('');
      NumUtil['defaultOptions'] = { separator: '^' };
      expect(NumUtil.format('foo.')).toBe('foo^');
      expect(NumUtil.format('foo.', { separator: '#' })).toBe('foo#');
      NumUtil['defaultOptions'] = {};
      NumUtil['defaultSeparator'] = '*';
      expect(NumUtil.format('foo.')).toBe('foo*');
   });

   it('should pad the number', () => {
      expect(NumUtil.pad(5, 3)).toBe('005');
      expect(NumUtil.pad(500, 2)).toBe('500');
   });

   it('should return if there are integers', () => {
      expect(NumUtil.hasOnlyIntegers('foo')).toBe(false);
      expect(NumUtil.hasOnlyIntegers('foo0')).toBe(false);
      expect(NumUtil.hasOnlyIntegers(undefined as unknown as string)).toBe(
         false
      );
      expect(NumUtil.hasOnlyIntegers('0')).toBe(true);
   });
});

describe('Util CoreUtil', () => {
   it('should return UUID', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      expect(CoreUtil.getUuid('foo')).toBe('foo80008000');
   });

   it('should determine if undefined', () => {
      expect(CoreUtil.isUndefined(undefined)).toBe(true);
      expect(CoreUtil.isUndefined('')).toBe(false);
   });
});

describe('Util StringUtil', () => {
   it('should check if starts with', () => {
      expect(StringUtil.startsWith('foo', 'fo')).toBe(true);
      expect(StringUtil.startsWith('foo', 'oo')).toBe(false);
      expect(StringUtil.startsWith(undefined as unknown as string, 'oo')).toBe(
         false
      );
   });

   it('should check if ends with', () => {
      expect(StringUtil.endsWith('foo', 'fo')).toBe(false);
      expect(StringUtil.endsWith('foo', 'oo')).toBe(true);
      expect(StringUtil.endsWith(undefined as unknown as string, 'oo')).toBe(
         false
      );
   });

   it('should format string', () => {
      expect(StringUtil.format('foo: {0}', 'bar')).toBe('foo: bar');
      expect(StringUtil.format('foo: {1}', 'bar')).toBe('foo: {1}');
   });
});

describe('Util HttpUtil', () => {
   it('should return query', () => {
      expect(HttpUtil.getQuery()).toEqual({});
   });

   it('should return parameter', () => {
      expect(HttpUtil.getParameter('foo')).toBeUndefined();
   });

   it('should parse query', () => {
      expect(HttpUtil.parseQuery('?foo=bar&bar=foo')).toEqual({
         foo: 'bar',
         bar: 'foo',
      });
   });

   it('should create query', () => {
      expect(HttpUtil.toQuery({ foo: 'bar', bar: 'foo' })).toBe(
         'foo=bar&bar=foo'
      );
   });
});
