import sys
import re

file_paths = [
    r"c:\Users\ncibi\Desktop\aidupkotlin\app\src\main\java\com\aidup\app\ui\screens\AllCampaignsScreen.kt",
    r"c:\Users\ncibi\Desktop\aidupkotlin\app\src\main\java\com\aidup\app\ui\screens\SearchDiscoveryScreen.kt"
]

replacements = {
    r'\bPrimary\b': 'MaterialTheme.colorScheme.primary',
    r'\bOnPrimary\b': 'MaterialTheme.colorScheme.onPrimary',
    r'\bSurfaceContainerHigh\b': 'MaterialTheme.colorScheme.surfaceContainerHigh',
    r'\bSurfaceContainerLowest\b': 'MaterialTheme.colorScheme.surfaceContainerLowest',
    r'\bSurfaceContainerHighest\b': 'MaterialTheme.colorScheme.surfaceContainerHighest',
    r'\bSurfaceContainerLow\b': 'MaterialTheme.colorScheme.surfaceContainerLow',
    r'\bOnSurface\b': 'MaterialTheme.colorScheme.onSurface',
    r'\bOnSurfaceVariant\b': 'MaterialTheme.colorScheme.onSurfaceVariant',
    r'\bSecondary\b': 'MaterialTheme.colorScheme.secondary',
    r'\bSecondaryFixed\b': 'MaterialTheme.colorScheme.secondaryContainer',
    r'\bBackground\b': 'MaterialTheme.colorScheme.background'
}

for path in file_paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pat, rep in replacements.items():
        content = re.sub(r'(?<!import com\.aidup\.app\.ui\.theme\.)' + pat, rep, content)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print("done")
