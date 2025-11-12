import csv
import json

input_file = "input.csv"
output_file = "data.json"

allowed_continents = ["Africa", "Asia", "Europe", "Oceania", "North America", "South America"]

data_by_year = {}
current_country = None
current_continent = None
header_difference = None

with open(input_file, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        code = row['Code'].strip()
        year = row['Year'].strip()
        diff = row['Difference'].strip()
        continent_col = row.get('Continent', '').strip()

        # Only consider allowed continents
        if continent_col and continent_col not in allowed_continents:
            current_continent = None
            continue

        # Header row for a new country
        if code:
            current_country = code
            current_continent = continent_col
            try:
                header_difference = float(diff)
            except:
                header_difference = None
            continue

        # Skip rows without a year
        if not year or current_continent is None:
            continue

        # Convert difference
        try:
            diff_val = float(diff) if diff else header_difference
        except:
            diff_val = header_difference

        # Initialize year
        if year not in data_by_year:
            data_by_year[year] = {}

        # Initialize continent inside year
        if current_continent not in data_by_year[year]:
            data_by_year[year][current_continent] = []

        # Add country entry
        entry = {"id": current_country, "difference": diff_val}
        data_by_year[year][current_continent].append(entry)

# Build final output with continents ordered and unique placeholders
final_output = {}
for year, continents in data_by_year.items():
    final_output[year] = []
    empty_counter = 1

    for i, continent in enumerate(allowed_continents):
        if continent in continents:
            final_output[year].extend(continents[continent])

            # Add two separators only if not the last included continent
            remaining = [c for c in allowed_continents[i+1:] if c in continents]
            if remaining:
                final_output[year].extend([
                    {"id": f"empty_{empty_counter}", "difference": None},
                    {"id": f"empty_{empty_counter+1}", "difference": None}
                ])
                empty_counter += 2

# Save JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(final_output, f, indent=2, ensure_ascii=False)

print(f"✅ JSON written to {output_file}")