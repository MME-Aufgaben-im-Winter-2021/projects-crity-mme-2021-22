let plugin = require("tailwindcss/plugin");

module.exports = {
    content: ["./app/**/*.{js,html}"],
    theme: {
        extend: {},
    },
    plugins: [
        plugin(({addVariant}) => {
            addVariant("selected", "&.selected");
        }),
    ],
};
