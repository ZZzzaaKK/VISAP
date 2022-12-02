package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.repository.CityElement;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/Shape.properties")
public interface Shape extends Config {
    @DefaultValue("Box")
    CityElement.CityShape attributeBuilding();
    @DefaultValue("Box")
    CityElement.CityShape interfaceBuilding();
    @DefaultValue("Box")
    CityElement.CityShape methodBuilding();
    @DefaultValue("Box")
    CityElement.CityShape reportBuilding();
    @DefaultValue("Box")
    CityElement.CityShape formRoutineBuilding();
    @DefaultValue("Box")
    CityElement.CityShape functionModuleBuilding();
    CityElement.CityShape defaultBuildingValue();
}
