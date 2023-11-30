library(readr)
library(ggplot2)
library(reshape2)
library(mi)
data<-read_csv("Desktop/repository/5702/Obesity-Data-Analysis/ObesityDataSet_raw_and_data_sinthetic.csv")
data
missing_values <- is.na(data)

# Reshape data for heatmap
long_data <- melt(missing_values, varnames = c("Variable", "Observation"))

# Create the heatmap
ggplot(long_data, aes(x = Variable, y = Observation, fill = value)) +
  geom_tile() +
  scale_fill_manual(values = c("TRUE" = "red", "FALSE" = "lightgreen")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        axis.title = element_blank())


md <- missing_data.frame(data)
