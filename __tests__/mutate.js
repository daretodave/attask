const Attask = require("../build/attask");

test("mutate", () => {

    expect.assertions(2);

    const expected = ["A", "B", "C", "D", "E"];
    const task = expected.map(letter => collection => collection.push(letter));

    it("async", () => Attask.provide([])
        .must(...task)
        .finally(collection => expect(collection)
            .toEqual(expect.arrayContaining(expected))
        )
        .run()
    );

    it("sync", () => Attask.sync()
        .provide([])
        .must(...task)
        .finally(collection => expect(collection)
            .toEqual(expect.arrayContaining(expected))
        )
        .run()
    );

});