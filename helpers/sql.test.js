const { sqlForPartialUpdate } = require('./your_module_path');  // Update with the correct path

describe('sqlForPartialUpdate', () => {
  it('should generate the correct SQL for partial update', () => {
    const dataToUpdate = {
      firstName: 'Alice',
      age: 30
    };
    const jsToSql = {
      firstName: 'first_name'
    };
    const expected = {
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Alice', 30]
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual(expected);
  });

  it('should throw BadRequestError if no data is provided', () => {
    const dataToUpdate = {};
    const jsToSql = {};
    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrowError(BadRequestError);
  });
});
