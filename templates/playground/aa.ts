export const asciiArts = {
    cow: {
        name: "牛さん",
        art: `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`
    },

    penguin: {
        name: "ペンギンさん",
        art: `
         \\
          \\
           \\  (o_o)
              (. .)
              /(v)\\
             /|   |\\
              |   |
              " " "`
    },

    whale: {
        name: "クジラさん",
        art: `
           \\
            \\    .
             \\  .____.....-----....._____
              \\ (                      /
               \\(                    /
                \\                  /
                 \\________________/`
    }
};

export type AnimalType = keyof typeof asciiArts;