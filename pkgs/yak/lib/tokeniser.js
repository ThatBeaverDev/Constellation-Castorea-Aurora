function tokeniseLine(input) {
    const tokens = [];
	let current = '';
	let i = 0;
    
	let quoteChar = null;
	let roundDepth = 0;
	let squareDepth = 0;
	let curlyDepth = 0;
    
	while (i < input.length) {
        const char = input[i];
        
		// within quotes
		if (quoteChar) {
            current += char;
			if (char === quoteChar && input[i - 1] !== '\\') {
                quoteChar = null;
			}
			i++;
			continue;
		}
        
		// quote starts
		if ((char === '"' || char === "'" || char === '`') && !quoteChar) {
            quoteChar = char;
			current += char;
			i++;
			continue;
		}
        
		// square brackets
		if (char === '[') {
            squareDepth++;
		} else if (char === ']') {
            squareDepth--;
		}
        
		// curly brackets
		if (char === '{') {
            curlyDepth++;
		} else if (char === '}') {
            curlyDepth--;
		}
        
		// brackets
		if (char === '(') {
            if (roundDepth === 0 && current.trim() !== '') {
                tokens.push(current.trim());
				current = '';
			}
			roundDepth++;
			current += char;
			i++;
			continue;
		} else if (char === ')') {
            roundDepth--;
			current += char;
			i++;
			if (roundDepth === 0) {
                const inner = current.slice(1, -1);
				const innerTokens = tokeniseLine(inner);
				tokens.push(innerTokens);
				current = '';
			}
			continue;
		}
        
		// split if outside brackets or quotes
		if (char === ' ' && !quoteChar && roundDepth === 0 && squareDepth === 0 && curlyDepth === 0) {
            if (current.trim() !== '') {
                tokens.push(current.trim());
				current = '';
			}
			i++;
			continue;
		}
        
		// append if no cases are met.
		current += char;
		i++;
	}
    
	// Push any remaining token
	if (current.trim() !== '') {
        tokens.push(current.trim());
	}
    
	return tokens;
}

function tokenise(input) {
    const result = []

    const lines = input.split("\n")

    for (const i in lines) {

        const line = String(lines[i]).replaceAll("\t", "    ").trimStart().trimEnd()

        result.push(tokeniseLine(line))
    }
    return result
}

return tokenise;