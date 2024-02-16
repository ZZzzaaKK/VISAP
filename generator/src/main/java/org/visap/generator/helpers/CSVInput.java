package org.visap.generator.helpers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.visap.generator.configuration.Config;

public class CSVInput {
    public static List<Path> getInputCSVFiles() {
        String path = Config.setup.inputCSVFilePath();
        File currentDir = new File(path);
        String helper = currentDir.getAbsolutePath();
        List<Path> files = new ArrayList<>();
        try {
            files = Files.walk(Paths.get(helper), 1)
                    .filter(Files::isRegularFile)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }
}
