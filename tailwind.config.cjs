let plugin = require("tailwindcss/plugin");

module.exports = {
    content: ["./dist/**/*.html"],
    theme: {
        extend: {},
    },
    plugins: [
        plugin(({addVariant}) => {
            addVariant("selected", "&.selected");
        }),
    ],
};
