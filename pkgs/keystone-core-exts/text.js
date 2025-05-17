function split(type, text) {
    switch (type) {
        case "txt":
            return text
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // remove punctuation so 'and' and 'and.' don't get counted seperately for example
                .split(/\s+/)
                .filter(Boolean);
    }
}

return split