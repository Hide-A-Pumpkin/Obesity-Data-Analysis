library(hexbin)
library(ggplot2)

data <- # new data
# Calculate hexagonal bins
hb <- hexbin(data$x, data$y, xbins = 30)

# Extract hexagon centers and counts
hex_centers <- hcell2xy(hb)
counts <- hb@count
hex_data <- data.frame(x = hex_centers$x, y = hex_centers$y, count = counts)

ggplot(hex_data, aes(x = x, y = y, fill = count)) +
  geom_polygon(aes(group = interaction(x, y)), 
               color = "white", 
               size = 0.5) +
  coord_fixed() +
  scale_fill_viridis_c() +
  theme_minimal() +
  labs(title = "Manual Hexagonal Heatmap",
       x = "X-axis Label",
       y = "Y-axis Label")
